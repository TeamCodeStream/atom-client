import Dexie from "dexie";
import { upsert, resolve } from "../lib/local-cache";

Dexie.debug = true;

const dbName = "local-cache-spec";
let db;

describe("local-cache", () => {
	beforeEach(() => {
		db = new Dexie(dbName);
		db.version(1).stores({
			records: "id",
			compounds: "[foo+bar]"
		});
	});

	afterEach(() => {
		Dexie.delete(dbName);
	});

	describe("resolver for modifications to objects", () => {
		it("can handle simple property assignment", () => {
			const changes = {
				name: "foo",
				age: 24,
				"child.age": 5
			};

			expect(resolve({ child: {} }, changes)).toEqual({ name: "foo", age: 24, child: { age: 5 } });
		});

		it("can $set", () => {
			const changes = {
				$set: {
					foo: "bar",
					"child.foo": "childBar"
				}
			};

			expect(resolve({ child: {} }, changes)).toEqual({ foo: "bar", child: { foo: "childBar" } });
		});

		it("can $unset", () => {
			const changes = {
				$unset: {
					foo: true,
					"child.bar": true
				}
			};

			expect(resolve({ foo: "bar", child: { bar: "foo" } }, changes)).toEqual({
				foo: undefined,
				child: { bar: undefined }
			});
		});

		it("can $push", () => {
			const changes = {
				$push: {
					things: 3,
					singleItem: "foo",
					"child.things": 1
				}
			};

			expect(
				resolve({ things: [1, 2], singleItem: "bar", child: { things: [] } }, changes)
			).toEqual({
				things: [1, 2, 3],
				singleItem: "bar",
				child: {
					things: [1]
				}
			});
		});

		it("can $pull", () => {
			const changes = {
				$pull: {
					things: 2,
					singleItem: "foo",
					"child.things": 1
				}
			};

			expect(
				resolve({ things: [1, 2], child: { things: [1, 2] }, singleItem: "bar" }, changes)
			).toEqual({
				things: [1],
				child: {
					things: [2]
				},
				singleItem: "bar"
			});
		});

		it("can $addToSet", () => {
			const changes = {
				$addToSet: {
					things: [3],
					otherThings: [4],
					singleItem: "foo",
					newProperty: "a",
					"child.things": 1
				}
			};

			expect(
				resolve(
					{ things: [1, 2], otherThings: [4, 5], singleItem: "bar", child: { things: [] } },
					changes
				)
			).toEqual({
				things: [1, 2, 3],
				otherThings: [4, 5],
				newProperty: ["a"],
				singleItem: "bar",
				child: {
					things: [1]
				}
			});
		});

		it("can $inc", () => {
			const changes = {
				$inc: {
					count: 3,
					newCount: 2,
					"child.count": 1
				}
			};

			expect(resolve({ count: 2, child: { count: 0 } }, changes)).toEqual({
				count: 5,
				newCount: 2,
				child: {
					count: 1
				}
			});
		});
	});

	describe("upsert", () => {
		afterEach(() => {
			waitsForPromise(() =>
				db.transaction("rw", db.records, () => db.records.each(r => db.records.delete(r.id)))
			);
		});

		describe("when a record with the given primaryKey doesn't exist", () => {
			it("creates a new record and returns a promise resolving with it", () => {
				waitsForPromise(async () => {
					const entry = { id: 1, attr1: "foo" };
					const record = await upsert(db, "records", entry);
					expect(record).toEqual(entry);
				});
			});
		});

		describe("when a record with the given primaryKey already exists", () => {
			it("modifies the record with the changes aand returns a promise resolving with it", () => {
				waitsForPromise(async () => {
					const original = { id: 1, attr1: "foo" };
					await db.records.add(original);
					const changes = { id: 1, attr1: "bar", attr2: "fizz" };
					const record = await upsert(db, "records", changes);
					expect(record).toEqual({ ...original, ...changes });
				});
			});
		});

		describe("when provided a collection of records", () => {
			it("upserts each and returns a collection of the persisted records", () => {
				waitsForPromise(async () => {
					const original1 = { id: 1, attr1: "foo" };
					const original2 = { id: 2, attr1: "bar" };
					await db.records.bulkAdd([original1, original2]);
					const changes1 = { id: 1, attr1: "bar", attr2: "fizz" };
					const changes2 = { id: 2, attr1: "foo", attr2: "fizz" };
					const records = await upsert(db, "records", [changes1, changes2]);
					expect(records).toEqual([changes1, changes2]);
				});
			});
		});

		describe("when the primaryKey is compound", () => {
			it("still upserts", () => {
				waitsForPromise(async () => {
					const compound = { foo: "foo", bar: "bar" };
					await upsert(db, "compounds", compound);
					const saved = await db.compounds.get(compound);
					expect(saved).toEqual(compound);
				});
			});
		});
	});
});
