import Dexie from "dexie";
import { fetchTeamMembers } from "../../lib/actions/team";

Dexie.debug = true;
let db;

describe("team action creators", () => {
	const getState = () => ({ session: { accessToken: "someToken" } });
	const http = { get: jasmine.createSpy().andReturn(Promise.resolve()) };

	const dispatch = jasmine.createSpy("dispatch spy").andCallFake(() => {
		const action = dispatch.mostRecentCall.args[0];
		if (action.apply) return action(dispatch, getState, { db, http });
		else return action;
	});

	beforeEach(() => {
		db = new Dexie("test1");
		db.version(1).stores({
			users: "id",
			teams: "id"
		});
	});

	afterEach(() => {
		Dexie.delete("test1");
	});

	describe("fetch team members", () => {
		it("will fetch for a single team", () => {
			waitsForPromise(async () => {
				const id = "id1";

				fetchTeamMembers(id)(dispatch, getState, { http });

				expect(http.get).toHaveBeenCalledWith(`/users?teamId=${id}`, "someToken");
			});
		});

		it("will fetch for multiple teams", () => {
			waitsForPromise(async () => {
				http.get = jasmine.createSpy().andReturn(Promise.resolve({ users: [{ _id: "1" }] }));
				const id1 = "id1";
				const id2 = "id2";

				await fetchTeamMembers([id1, id2])(dispatch, getState, { http });

				waitsFor(() => http.get.callCount === 2);
				runs(() => {
					expect(http.get).toHaveBeenCalledWith(`/users?teamId=${id1}`, "someToken");
					expect(http.get).toHaveBeenCalledWith(`/users?teamId=${id2}`, "someToken");
				});
			});
		});
	});
});
