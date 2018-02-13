import Dexie from "dexie";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import { fetchStreams } from "../../lib/actions/stream";

const dbName = "stream-spec";
Dexie.debug = true;
let db;

describe("stream action creators", () => {
	const getState = () => ({ session: { accessToken: "someToken" } });

	beforeEach(() => {
		db = new Dexie(dbName);
		db.version(1).stores({
			streams: "id, teamId, repoId"
		});
	});

	afterEach(() => {
		Dexie.delete(dbName);
	});

	describe("fetchStreams", () => {
		it("will fetch all streams", () => {
			waitsForPromise(async () => {
				let count = 0;
				const http = {};
				http.get = jasmine.createSpy("http.get").andCallFake(() => {
					const current = ++count;
					if (current < 3)
						return Promise.resolve({
							streams: [{ _id: `s${current}`, sortId: current }],
							more: true
						});
					else
						return Promise.resolve({
							streams: [{ _id: `s${current}`, file: `s${current}.file`, sortId: current }]
						});
				});

				const teamId = "t1";
				const repoId = "r1";
				const accessToken = "token";
				const state = {
					context: { currentTeamId: teamId, currentRepoId: repoId },
					session: { accessToken: accessToken }
				};
				const store = configureStore([thunk.withExtraArgument({ db, http })])(state);
				const id1 = "id1";
				const id2 = "id2";

				await store.dispatch(fetchStreams());

				const streams = await db.streams.toArray();
				expect(streams.length).toBe(3);
				expect(store.getActions().length).toBe(3);

				expect(http.get).toHaveBeenCalledWith(
					`/streams?teamId=${teamId}&repoId=${repoId}`,
					accessToken
				);
				expect(http.get).toHaveBeenCalledWith(
					`/streams?teamId=${teamId}&repoId=${repoId}&lt=${1}`,
					accessToken
				);
				expect(http.get).toHaveBeenCalledWith(
					`/streams?teamId=${teamId}&repoId=${repoId}&lt=${2}`,
					accessToken
				);
			});
		});
	});
});
