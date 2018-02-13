import { parseCommitters } from "../lib/components/onboarding/teamMemberSelectionForm";

describe("parseCommitters", () => {
	it("can return a unique list of objects", () => {
		const input = [
			"Tom Ford<trim-this>tom@foo.com",
			"Sam<trim-this>sam@bar.com",
			"tom<trim-this>tom@foo.com"
		];
		expect(parseCommitters(input)).toEqual([
			{ firstName: "Tom", lastName: "Ford", name: "Tom Ford", email: "tom@foo.com" },
			{ firstName: "Sam", lastName: "", name: "Sam", email: "sam@bar.com" }
		]);
	});

	it("adds provided properties to the objects", () => {
		const input = ["Tom<trim-this>tom@foo.com", "Sam<trim-this>sam@bar.com"];
		expect(parseCommitters(input, { selected: true })).toEqual([
			{ name: "Tom", firstName: "Tom", lastName: "", email: "tom@foo.com", selected: true },
			{ name: "Sam", firstName: "Sam", lastName: "", email: "sam@bar.com", selected: true }
		]);
	});

	it("filters out empty emails", () => {
		const input = [
			"Tom<trim-this>tom@foo.com",
			"Sam<trim-this>sam@bar.com",
			"Steve<trim-this>(none)"
		];
		expect(parseCommitters(input, { selected: true })).toEqual([
			{ name: "Tom", firstName: "Tom", lastName: "", email: "tom@foo.com", selected: true },
			{ name: "Sam", firstName: "Sam", lastName: "", email: "sam@bar.com", selected: true }
		]);
	});
});
