import React from "react";
import { Provider } from "react-redux";
import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { mountWithIntl } from "./intl-test-helper.js";
import { SimpleTeamCreationForm } from "../lib/components/onboarding/TeamCreationForm";
import createStore from "../lib/createStore";

Enzyme.configure({ adapter: new Adapter() });

const store = createStore({ connectivity: { offline: false } });

describe("TeamCreationForm", () => {
	describe("name input", () => {
		it("shows errors when left empty", () => {
			const view = mountWithIntl(
				<Provider store={store}>
					<SimpleTeamCreationForm errors={{}} />
				</Provider>
			);
			view.find("input").simulate("blur");
			expect(view.find("input").exists()).toBe(true);
		});
	});

	describe("submit button", () => {
		it("is disabled while the form is invalid", () => {
			const view = mountWithIntl(
				<Provider store={store}>
					<SimpleTeamCreationForm errors={{}} />
				</Provider>
			);
			expect(view.find("Button").prop("disabled")).toBe(true);
		});

		it("is enabled while the form is valid", () => {
			const view = mountWithIntl(
				<Provider store={store}>
					<SimpleTeamCreationForm errors={{}} />
				</Provider>
			);
			view.find("input").simulate("change", { target: { value: "Foo Team" } });
			expect(view.find("Button").prop("disabled")).toBe(false);
		});
	});

	describe("when the form is submitted", () => {
		it("calls the createTeam function", () => {
			const name = "Foo Team";
			const url = "foobar.com";
			const firstCommitHash = "123ba3";
			const team = { name };
			const store = { getState: () => ({ repoAttributes: { url, firstCommitHash } }) };
			const createTeam = jasmine.createSpy("createTeam stub").andReturn(Promise.resolve());
			const view = mountWithIntl(
				<Provider store={createStore({ connectivity: { offline: false } })}>
					<SimpleTeamCreationForm createTeam={createTeam} errors={{}} />
				</Provider>
			);

			view.find("input").simulate("change", { target: { value: name } });
			view.find("form").simulate("submit");

			waitsFor(() => createTeam.callCount > 0);
			runs(() => expect(createTeam).toHaveBeenCalledWith(name));
		});
	});
});
