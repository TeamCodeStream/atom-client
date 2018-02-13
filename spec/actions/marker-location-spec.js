import Dexie from "dexie";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import { markerDirtied, saveMarkerLocations } from "../../lib/actions/marker-location";

const dbName = "marker-location-spec";

Dexie.debug = true;
let db;

describe("marker-location action creators", () => {
	const teamId = "t1";
	const streamId = "s1";
	const markerId = "m1";
	const markerId2 = "m2";
	const commitHash = "c1";
	const location = [7, 0, 13, 0];
	const location2 = [0, 7, 3, 0];

	beforeEach(() => {
		db = new Dexie(dbName);
		db.version(1).stores({
			markerLocations: "[streamId+teamId+commitHash]"
		});
	});

	afterEach(() => {
		Dexie.delete(dbName);
	});

	describe("saveMarkerLocations", () => {
		it("saves locations by streamId+teamId+commitHash", () => {
			const store = configureStore([thunk.withExtraArgument({ db })])();
			const markerLocations = {
				teamId,
				streamId,
				commitHash,
				locations: { [markerId]: location, [markerId2]: location2 }
			};

			waitsForPromise(async () => {
				await store.dispatch(saveMarkerLocations(markerLocations));
				expect(store.getActions()).toContain({
					type: "ADD_MARKER_LOCATIONS",
					payload: markerLocations,
					isHistory: false
				});
				const record = await db.markerLocations.get({ streamId, teamId, commitHash });
				expect(record).toEqual(markerLocations);
			});
		});

		it("updates an existing record for streamId+teamId+commitHash", () => {
			const store = configureStore([thunk.withExtraArgument({ db })])();
			const markerLocations = {
				teamId,
				streamId,
				commitHash,
				locations: { [markerId2]: [1, 2, 3, 4] }
			};
			const expectedRecord = {
				teamId,
				streamId,
				commitHash,
				locations: { [markerId]: location, [markerId2]: [1, 2, 3, 4] },
				dirty: {}
			};
			waitsForPromise(async () => {
				await db.markerLocations.add({
					streamId,
					teamId,
					commitHash,
					locations: { [markerId]: location }
				});

				await store.dispatch(saveMarkerLocations(markerLocations));

				expect(store.getActions()).toContain({
					type: "ADD_MARKER_LOCATIONS",
					payload: expectedRecord,
					isHistory: false
				});
				const record = await db.markerLocations.get({ streamId, teamId, commitHash });
				expect(record).toEqual(expectedRecord);
			});
		});
	});

	describe("markerDirtied", () => {
		it("saves the new location", () => {
			const store = configureStore([thunk.withExtraArgument({ db })])({
				context: { currentCommit: commitHash, currentTeamId: teamId }
			});
			const oldLocation = [1, 2, 3, 4];
			const newLocation = [2, 3, 4, 5];
			const expectedRecord = {
				teamId,
				streamId,
				commitHash,
				locations: { [markerId]: oldLocation },
				dirty: { [markerId]: newLocation }
			};
			waitsForPromise(async () => {
				await db.markerLocations.add({
					teamId,
					commitHash,
					streamId,
					locations: { [markerId]: oldLocation }
				});
				await store.dispatch(markerDirtied({ markerId, streamId }, newLocation));
				expect(store.getActions()).toContain({ type: "MARKER_DIRTIED", payload: expectedRecord });
				const locations = await db.markerLocations.get({ streamId, teamId, commitHash });
				expect(locations).toEqual(expectedRecord);
			});
		});
	});

	xdescribe("commitNewMarkerLocations", () => {
		it("sends dirty locations to server and overwrites the local locations", () => {
			const http = { put: jasmine.createSpy().andReturn(Promise.resolve()) };
			const store = configureStore([thunk.withExtraArgument({ db, http })])({
				context: { currentCommit: commitHash, currentTeamId: teamId }
			});
			const oldLocation = [1, 2, 3, 4];
			const newLocation = [2, 3, 4, 5];

			waitsForPromise(async () => {
				await db.markerLocations.add({
					teamId,
					commitHash,
					streamId,
					locations: { [markerId]: oldLocation },
					dirty: { [markerId]: newLocation }
				});

				const expectedRecord = [
					{ teamId, commitHash, streamId, locations: { [markerId]: newLocation } }
				];

				await store.dispatch(commitNewMarkerLocations());
				expect(store.getActions()).toContain({
					type: "MARKER_LOCATIONS_COMMITTED_TO_SERVER",
					payload: [expectedRecord]
				});
				const locations = await db.markerLocations.get({ streamId, teamId, commitHash });
				expect(locations).toEqual(expectedRecord);
			});
		});
	});
});
