import reduce from "../../lib/reducers/streams";

const stream1 = { id: "s1", repoId: "r1", file: "s1.file" };
const stream2 = { id: "s2", repoId: "r1", file: "s2.file" };
const stream3 = { id: "s3", repoId: "r2", file: "s3.file" };

describe("reducer for .streams", () => {
	it("bootstraps data", () => {
		const result = reduce(undefined, {
			type: "BOOTSTRAP_STREAMS",
			payload: [stream1, stream2, stream3]
		});

		expect(result).toEqual({
			byRepo: {
				[stream1.repoId]: {
					byFile: {
						[stream1.file]: stream1,
						[stream2.file]: stream2
					}
				},
				[stream3.repoId]: {
					byFile: {
						[stream3.file]: stream3
					}
				}
			}
		});
	});

	it("adds a stream", () => {
		const state = {
			byRepo: {
				[stream1.repoId]: {
					byFile: {
						[stream1.file]: stream1
					}
				},
				[stream3.repoId]: {
					byFile: {
						[stream3.file]: stream3
					}
				}
			}
		};

		const result = reduce(state, { type: "ADD_STREAM", payload: stream2 });

		expect(result).toEqual({
			byRepo: {
				...state.byRepo,
				[stream2.repoId]: {
					byFile: {
						...state.byRepo[stream2.repoId].byFile,
						[stream2.file]: stream2
					}
				}
			}
		});
	});
});
