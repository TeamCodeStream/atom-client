import reduce from "../../lib/reducers/markers";

const marker1 = { streamId: "stream", id: "marker1" };
const marker2 = { streamId: "stream", id: "marker2" };
const marker3 = { streamId: "stream", id: "marker3" };

describe("reducer for markers", () => {
	it("bootstraps data", () => {
		const result = reduce(undefined, {
			type: "BOOTSTRAP_MARKERS",
			payload: [marker1, marker2, marker3]
		});

		expect(result).toEqual({
			marker1,
			marker2,
			marker3
		});
	});

	it("adds markers", () => {
		const state = {};

		const expected = {
			marker1,
			marker2
		};

		const result = reduce(state, { type: "ADD_MARKERS", payload: [marker1, marker2] });

		expect(result).toEqual(expected);
	});
});
