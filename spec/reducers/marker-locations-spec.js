import reduce from "../../lib/reducers/marker-locations";

const locations = {
	teamId: "5a2f611486d0fdeeeb51b78a",
	streamId: "5a2f612586d0fdeeeb51b78c",
	commitHash: "57299ce2113d0c16f8ff3f4310897b690669f72a",
	locations: { "5a2f66b486d0fdeeeb51b793": [80, 81, 0, 0] }
};

const locations2 = {
	teamId: "5a2f611486d0fdeeeb51b78a",
	streamId: "streamId",
	commitHash: "commitHash",
	locations: { someMarker: [80, 81, 0, 0] }
};

const locationsWithLocalChanges = {
	teamId: "5a2f611486d0fdeeeb51b78a",
	streamId: "otherStreamId",
	commitHash: "otherCommitHash",
	locations: { otherMarker: [80, 81, 0, 0], aMarker: [1, 2, 3, 4] },
	dirty: { otherMarker: [92, 81, 0, 0] }
};

describe("reducer for marker locations", () => {
	it("bootstraps data", () => {
		const result = reduce(undefined, {
			type: "BOOTSTRAP_MARKER_LOCATIONS",
			payload: [locations, locations2, locationsWithLocalChanges]
		});

		expect(result).toEqual({
			byStream: {
				[locations.streamId]: {
					[locations.commitHash]: locations.locations
				},
				[locations2.streamId]: {
					[locations2.commitHash]: locations2.locations
				},
				[locationsWithLocalChanges.streamId]: {
					[locationsWithLocalChanges.commitHash]: {
						...locationsWithLocalChanges.locations,
						...locationsWithLocalChanges.dirty
					}
				}
			}
		});
	});

	describe("adding locations", () => {
		describe("when adding a new location object", () => {
			it("adds locations", () => {
				const state = { byStream: {} };

				const expected = {
					byStream: {
						[locations.streamId]: {
							[locations.commitHash]: locations.locations
						}
					}
				};

				const result = reduce(state, { type: "ADD_MARKER_LOCATIONS", payload: locations });

				expect(result).toEqual(expected);
			});
		});

		describe("when adding a location object with an existing commitHash", () => {
			it("updates the existing object", () => {
				const state = {
					byStream: {
						[locations.streamId]: {
							[locations.commitHash]: locations.locations
						}
					}
				};

				const updatedLocations = {
					...locations,
					locations: { markerId: [0] }
				};

				const result = reduce(state, { type: "ADD_MARKER_LOCATIONS", payload: updatedLocations });

				expect(result).toEqual({
					byStream: {
						[locations.streamId]: {
							[locations.commitHash]: { ...locations.locations, ...updatedLocations.locations }
						}
					}
				});
			});
		});

		describe("when adding a location object for a new commitHash", () => {
			it("updates the existing object", () => {
				const state = {
					byStream: {
						[locations.streamId]: {
							[locations.commitHash]: locations.locations
						}
					}
				};

				const updatedLocations = {
					...locations,
					commitHash: "newCommit",
					locations: { markerId: [0] }
				};

				const result = reduce(state, { type: "ADD_MARKER_LOCATIONS", payload: updatedLocations });

				expect(result).toEqual({
					byStream: {
						[locations.streamId]: {
							[locations.commitHash]: locations.locations,
							[updatedLocations.commitHash]: updatedLocations.locations
						}
					}
				});
			});
		});
	});

	describe("MARKER_DIRTIED", () => {
		it("uses the dirty location over the original location", () => {
			const state = {
				byStream: {
					[locations.streamId]: {
						[locations.commitHash]: locations.locations
					}
				}
			};

			const payload = {
				teamId: locations.teamId,
				streamId: locations.streamId,
				commitHash: locations.commitHash,
				locations: { someMarker: [1, 2, 3, 4] }
			};
			const result = reduce(state, { type: "MARKER_DIRTIED", payload });

			expect(result).toEqual({
				byStream: {
					[locations.streamId]: {
						[locations.commitHash]: { ...locations.locations, someMarker: [1, 2, 3, 4] }
					}
				}
			});
		});
	});
});
