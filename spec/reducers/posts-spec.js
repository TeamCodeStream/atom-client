import reduce, { getPostsForStream } from "../../lib/reducers/posts";

const post1 = { streamId: "1", id: "1-1", text: "text1" };
const post2 = { streamId: "1", id: "1-2", text: "text2" };
const post3 = { streamId: "2", id: "2-1", text: "text3" };
const pendingPost = { streamId: "2", id: "2-1", text: "text4", pending: true };

describe("reducer for posts", () => {
	describe("BOOTSTRAP_POSTS", () => {
		it("saves posts and pending posts", () => {
			const postsFromDb = [post1, post2, post3, pendingPost];

			const bootstrapResult = reduce(undefined, { type: "BOOTSTRAP_POSTS", payload: postsFromDb });

			expect(bootstrapResult).toEqual({
				byStream: {
					"1": { [post1.id]: post1, [post2.id]: post2 },
					"2": { [post3.id]: post3 }
				},
				pending: [pendingPost]
			});
		});
	});

	describe("ADD_POSTS", () => {
		it("saves posts", () => {
			const addResult = reduce(undefined, { type: "ADD_POSTS", payload: [post1, post2, post3] });

			expect(addResult).toEqual({
				byStream: {
					"1": { [post1.id]: post1, [post2.id]: post2 },
					"2": { [post3.id]: post3 }
				},
				pending: []
			});
		});
	});

	describe("adding posts in bulk", () => {
		it("updates the existing ones", () => {
			const state = {
				byStream: {
					"1": { [post1.id]: post1, [post2.id]: post2 },
					"2": { [post3.id]: post3 }
				}
			};

			const replacementForPost2 = { streamId: "1", id: "1-2", text: "changing post2 text" };
			const newPost = { streamId: "1", id: "1-3", text: "text4" };
			const newPosts = [replacementForPost2, newPost];

			const expected = {
				byStream: {
					"1": { [post1.id]: post1, [post2.id]: replacementForPost2, [newPost.id]: newPost },
					"2": { [post3.id]: post3 }
				}
			};

			const action = {
				type: "ADD_POSTS_FOR_STREAM",
				payload: { streamId: "1", posts: newPosts }
			};

			expect(reduce(state, action)).toEqual(expected);
		});
	});

	describe("pending posts", () => {
		describe("ADD_PENDING_POST", () => {
			it("adds pending posts for non-existent streams", () => {
				const state = { byStream: {}, pending: [] };
				const pendingPost = { id: post2.id };
				const action = {
					type: "ADD_PENDING_POST",
					payload: pendingPost
				};
				expect(reduce(state, action).pending).toEqual([pendingPost]);
			});
		});

		describe("RESOLVE_PENDING_POST", () => {
			it("removes pending post and adds to appropriate stream", () => {
				const state = {
					byStream: {
						"1": { [post1.id]: post1 }
					},
					pending: [post2]
				};

				const resolvedPost = { streamId: "2", id: "2-2", text: "text4" };

				const action = {
					type: "RESOLVE_PENDING_POST",
					payload: { pendingId: post2.id, post: resolvedPost }
				};

				expect(reduce(state, action)).toEqual({
					byStream: {
						...state.byStream,
						[resolvedPost.streamId]: { [resolvedPost.id]: resolvedPost }
					},
					pending: []
				});
			});
		});

		describe("PENDING_POST_FAILED", () => {
			it("updates the pending post", () => {
				const state = {
					byStream: {},
					pending: [post1]
				};

				const action = { type: "PENDING_POST_FAILED", payload: { ...post1, error: true } };

				expect(reduce(state, action)).toEqual({
					byStream: {},
					pending: [action.payload]
				});
			});
		});

		describe("CANCEL_PENDING_POST", () => {
			it("removes the pending post", () => {
				const state = {
					byStream: {},
					pending: [post1]
				};

				const action = { type: "CANCEL_PENDING_POST", payload: post1.id };

				expect(reduce(state, action)).toEqual({
					byStream: {},
					pending: []
				});
			});
		});
	});
});

describe("getPostsForStream selector", () => {
	const stream1Post1 = { streamId: "1", id: "1-1", text: "text1", seqNum: 1 };
	const stream1Post2 = { streamId: "1", id: "1-2", text: "text2", seqNum: 2 };
	const stream2Post1 = { streamId: "2", id: "2-1", text: "text3", seqNum: 1 };
	const stream2PendingPost2 = { streamId: "2", id: "2-2", text: "text4" };
	const newFilePendingPost1 = { id: "1?", text: "text5", stream: { file: "dir/newFile" } };
	const state = {
		byStream: {
			"1": { [stream1Post1.id]: stream1Post1, [stream1Post2.id]: stream1Post2 },
			"2": { [stream2Post1.id]: stream2Post1 }
		},
		pending: [stream2PendingPost2, newFilePendingPost1]
	};

	it("returns an empty list if no streamId provided", () => {
		expect(getPostsForStream(state)).toEqual([]);
	});

	it("returns posts for the stream", () => {
		expect(getPostsForStream(state, "1")).toEqual([stream1Post1, stream1Post2]);
	});

	it("includes pending posts for the streamId", () => {
		expect(getPostsForStream(state, "2")).toEqual([stream2Post1, stream2PendingPost2]);
	});

	describe("when there is no stream yet and a filePath is passed as streamId", () => {
		it("includes pending posts for the filePath", () => {
			expect(getPostsForStream(state, "dir/newFile")).toEqual([newFilePendingPost1]);
		});
	});
});
