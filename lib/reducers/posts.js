import _ from "underscore-plus";

const initialState = {
	byStream: {},
	pending: []
};

const addPost = (byStream, post) => {
	const streamId = post.streamId;
	const streamPosts = byStream[streamId] || {};
	return { ...byStream, [streamId]: { ...streamPosts, [post.id]: post } };
};

export default (state = initialState, { type, payload }) => {
	switch (type) {
		case "ADD_POSTS":
		case "BOOTSTRAP_POSTS": {
			const nextState = {
				pending: [...state.pending],
				byStream: { ...state.byStream }
			};
			payload.forEach(post => {
				if (post.pending) nextState.pending.push(post);
				else nextState.byStream = addPost(nextState.byStream, post);
			});
			return nextState;
		}
		case "ADD_POSTS_FOR_STREAM": {
			const { streamId, posts } = payload;
			const streamPosts = { ...(state.byStream[streamId] || {}) };
			posts.forEach(post => {
				streamPosts[post.id] = post;
			});

			return {
				...state,
				byStream: { ...state.byStream, [streamId]: streamPosts }
			};
		}
		case "POSTS-UPDATE_FROM_PUBNUB":
		case "ADD_POST":
			return {
				...state,
				byStream: addPost(state.byStream, payload)
			};
		case "ADD_PENDING_POST": {
			return { ...state, pending: [...state.pending, payload] };
		}
		case "RESOLVE_PENDING_POST": {
			const { pendingId, post } = payload;
			return {
				byStream: addPost(state.byStream, post),
				pending: state.pending.filter(post => post.id !== pendingId)
			};
		}
		case "PENDING_POST_FAILED": {
			return {
				...state,
				pending: state.pending.map(post => {
					if (post.id === payload.id) return payload;
					else post;
				})
			};
		}
		case "CANCEL_PENDING_POST": {
			return {
				...state,
				pending: state.pending.filter(post => post.id !== payload)
			};
		}
		default:
			return state;
	}
};

// If stream for a pending post is created, the pending post will be lost (not displayed)
// TODO: reconcile pending posts for a file with stream when the stream is created
export const getPostsForStream = ({ byStream, pending }, streamId = "") => {
	if (streamId === "") return [];
	const pendingForStream = pending.filter(it => {
		try {
			return it.streamId === streamId || it.stream.file === streamId;
		} catch (e) {
			return false;
		}
	});
	return [..._.sortBy(byStream[streamId], "seqNum"), ...pendingForStream];
};
