import _ from "underscore-plus";
import { upsert } from "../local-cache";
import { normalize } from "./utils";
import { setUserPreference } from "./user";
import { fetchLatestPosts } from "./post";
import { getStreamsForRepo, getStreamForRepoAndFile } from "../reducers/streams";

export const markStreamRead = streamId => async (dispatch, getState, { http }) => {
	const { session, context, streams } = getState();
	if (!streamId) return;
	if (context.currentFile === "") return;

	const markReadData = await http.put("/read/" + streamId, {}, session.accessToken);
	dispatch({ type: "CLEAR_UMI", payload: streamId });
	// console.log("READ THE STREAM", markReadData, session);
};

export const setStreamUMITreatment = (path, setting) => async (dispatch, getState) => {
	const { session, context, users } = getState();
	let repo = atom.project.getRepositories()[0];
	let relativePath = repo.relativize(path);
	let prefPath = ["streamTreatments", context.currentRepoId, relativePath];
	dispatch(setUserPreference(prefPath, setting));
	dispatch(recalculate(true));
	return;
};

export const incrementUMI = post => async (dispatch, getState, { db }) => {
	const { session, context, users, streams } = getState();
	const currentUser = users[session.userId];

	// don't increment UMIs for posts you wrote yourself
	if (post.creatorId === session.userId) return;

	// don't increment the UMI of the current stream, presumably because you
	// see the post coming in. FIXME -- if we are not scrolled to the bottom,
	// we should still increment the UMI
	const currentStream = getStreamForRepoAndFile(
		streams,
		context.currentRepoId,
		context.currentFile
	);
	if (currentStream && currentStream.id === post.streamId) return;

	var hasMention = post.text.match("@" + currentUser.username + "\\b");
	let type = hasMention ? "INCREMENT_MENTION" : "INCREMENT_UMI";
	dispatch({
		type: type,
		payload: post.streamId
	});

	// if the user is up-to-date on this stream, then we need to create a pointer
	// to the first unread message in the stream, stored in lastReads
	currentUser.lastReads = currentUser.lastReads || {};
	if (!currentUser.lastReads[post.streamId]) {
		currentUser.lastReads[post.streamId] = post.id;

		return upsert(db, "users", currentUser).then(user =>
			dispatch({
				type: "UPDATE_USER",
				payload: user
			})
		);
	}
};

export const recalculate = force => async (dispatch, getState, { http }) => {
	const { context, session, users, streams, posts } = getState();
	const currentUser = users[session.userId];

	let mentionRegExp = new RegExp("@" + currentUser.username + "\\b");

	let lastReads = currentUser.lastReads || {};
	let nextState = { mentions: {}, unread: {} };
	if (force) nextState.count = new Date().getTime();
	let streamsById = {};
	const streamsByFile = getStreamsForRepo(streams, context.currentRepoId) || {};
	Object.entries(streamsByFile).forEach(([file, stream]) => {
		streamsById[stream.id] = stream;
	});
	Object.entries(lastReads).forEach(([streamId, lastRead]) => {
		let unread = 0;
		let mentions = 0;
		if (lastRead) {
			// find the stream
			// then calculate the unread Messages
			let stream = streamsById[streamId];
			const postsForStream = _.sortBy(posts.byStream[streamId], "seqNum");

			if (!postsForStream) return;
			let postIds = postsForStream.map(post => post.id);
			let index = postIds.indexOf(lastRead);
			let postsLength = postsForStream.length;
			for (let i = index; i < postsLength; i++) {
				unread++;
				let post = postsForStream[i];
				if (post && post.text && post.text.match(mentionRegExp)) {
					mentions++;
				}
			}
			if (unread) nextState.unread[streamId] = unread;
			if (mentions) nextState.mentions[streamId] = mentions;
		}
	});

	dispatch({
		type: "SET_UMI",
		payload: nextState
	});
};
