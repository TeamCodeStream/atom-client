import Dexie from "dexie";
import { resolveFromPubnub } from "../../lib/actions/pubnub-event";

Dexie.debug = true;
let db;

describe("resolveFromPubnub action creator", () => {
	const dispatch = jasmine.createSpy("dispatch spy").andCallFake(() => {
		const action = dispatch.mostRecentCall.args[0];
		if (action.apply) return action(dispatch, null, { db });
		else return action;
	});

	beforeEach(() => {
		db = new Dexie("test1");
		db.version(1).stores({
			records: "id",
			things: "id"
		});
	});

	afterEach(() => {
		Dexie.delete("test1");
	});

	describe("resolveFromPubnub", () => {
		describe("when changes apply to a record not in the local cache", () => {
			it("adds a new record", () => {
				waitsForPromise(async () => {
					await resolveFromPubnub("records", { id: "id1", foo: "bar" })(dispatch, null, { db });
					const record = await db.records.get("id1");
					expect(record).toEqual({ id: "id1", foo: "bar" });
				});
			});
		});

		describe("a single change", () => {
			it("updates the local cache with the changes provided and dispatches an update action", () => {
				const id = "id1";
				const changes = {
					id,
					name: "fizz",
					$set: { foo: "bar" },
					$unset: { oldProperty: true },
					$addToSet: {
						things: 2
					}
				};
				waitsForPromise(async () => {
					await db.records.add({ id, oldProperty: "ipsum", things: [1] });
					await resolveFromPubnub("records", changes)(dispatch, null, { db });
					const record = await db.records.get(id);
					const expected = { id, name: "fizz", foo: "bar", things: [1, 2] };

					expect(record).toEqual(expected);
					expect(dispatch).toHaveBeenCalledWith({
						type: "RECORDS-UPDATE_FROM_PUBNUB",
						payload: expected,
						isHistory: false
					});
				});
			});
		});

		describe("a collection of changes", () => {
			it("updates the local cache with all the changes provided and dispatches multiple update actions", () => {
				const id1 = "id1";
				const id2 = "id2";
				const changes = [
					{
						id: id1,
						name: "fizz"
					},
					{
						id: id2,
						name: "buzz"
					}
				];
				waitsForPromise(async () => {
					await db.records.bulkAdd([{ id: id1 }, { id: id2 }]);
					await resolveFromPubnub("records", changes)(dispatch, null, { db });
					const records = await db.records.toArray();
					const expectedRecord1 = { id: id1, name: "fizz" };
					const expectedRecord2 = { id: id2, name: "buzz" };

					expect(records).toContain(expectedRecord1);
					expect(records).toContain(expectedRecord2);
					expect(dispatch).toHaveBeenCalledWith({
						type: "RECORDS-UPDATE_FROM_PUBNUB",
						payload: expectedRecord1,
						isHistory: false
					});
					expect(dispatch).toHaveBeenCalledWith({
						type: "RECORDS-UPDATE_FROM_PUBNUB",
						payload: expectedRecord2,
						isHistory: false
					});
				});
			});
		});

		describe("historical updates", () => {
			it("have isHistory as true", () => {
				const id = "id1";
				const changes = {
					id,
					name: "fizz"
				};
				waitsForPromise(async () => {
					await db.records.add({ id });
					await resolveFromPubnub("records", changes, true)(dispatch, null, { db });
					const record = await db.records.get(id);
					const expected = { id, name: "fizz" };

					expect(record).toEqual(expected);
					expect(dispatch).toHaveBeenCalledWith({
						type: "RECORDS-UPDATE_FROM_PUBNUB",
						payload: expected,
						isHistory: true
					});
				});
			});
		});
	});
});
