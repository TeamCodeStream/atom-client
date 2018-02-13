import React from "react";
import { Provider } from "react-redux";
import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { mountWithIntl } from "./intl-test-helper.js";
import TeamSelectionForm, {
	SimpleTeamSelectionForm
} from "../lib/components/onboarding/TeamSelectionForm";
import createStore from "../lib/createStore";
import { teamNotFound, noPermission } from "../lib/actions/onboarding";

Enzyme.configure({ adapter: new Adapter() });

const firstCommitHash = "123ab";
const repoUrl = "https:repo.com/mine.git";

const team1 = { id: "1", name: "The Foobars" };
const team2 = { id: "2", name: "Cool Coders" };

const store = createStore({
	connectivity: { offline: false },
	session: { userId: "userId" },
	users: { userId: { id: "userId", teamIds: ["1", "2"] } },
	teams: { "1": team1, "2": team2, "3": { id: "3", name: "Open Sourcerers" } },
	repoAttributes: {
		url: repoUrl,
		firstCommitHash
	}
});

describe("TeamSelectionForm", () => {
	it("has radio inputs for each of the user's teams and one for creating a new team", () => {
		const view = mountWithIntl(
			<Provider store={store}>
				<TeamSelectionForm />
			</Provider>
		);
		const inputs = view.find(".input-label");
		expect(inputs.at(0).text()).toBe("Create a new team");
		expect(inputs.at(1).text()).toBe("The Foobars");
		expect(inputs.at(2).text()).toBe("Cool Coders");
	});

	describe("when the 'Create new team' option is selected", () => {
		it("shows errors when the text field is left empty", () => {
			const view = mountWithIntl(
				<Provider store={store}>
					<TeamSelectionForm />
				</Provider>
			);
			view
				.find('input[value="createTeam"]')
				.simulate("change", { target: { value: "createTeam" } });
			view.find("#name-input").simulate("blur");
			expect(view.find("#name-input").prop("required")).toBe(true);
		});
	});

	describe("submit button", () => {
		it("is disabled while the form is invalid", () => {
			const view = mountWithIntl(
				<Provider store={store}>
					<TeamSelectionForm />
				</Provider>
			);
			expect(view.find("Button").prop("disabled")).toBe(true);
		});

		it("is enabled while the form is valid", () => {
			const view = mountWithIntl(
				<Provider store={store}>
					<TeamSelectionForm />
				</Provider>
			);
			view
				.find('input[type="radio"]')
				.at(1)
				.simulate("change", { target: { value: "1" } });
			expect(view.find("Button").prop("disabled")).toBe(false);
		});
	});

	describe("when the form is submitted", () => {
		describe("when the user selects an existing team", () => {
			it("calls the addRepoForTeam function with the teamId", () => {
				const addRepoForTeam = jasmine.createSpy("addRepoForTeam stub");
				const view = mountWithIntl(
					<Provider store={store}>
						<SimpleTeamSelectionForm
							addRepoForTeam={addRepoForTeam}
							teams={[team1, team2]}
							loading={false}
							errors={{}}
						/>
					</Provider>
				);

				view
					.find('input[type="radio"]')
					.at(1)
					.simulate("change", { target: { value: team1.id } });

				view.find("form").simulate("submit");

				waitsFor(() => addRepoForTeam.callCount > 0);
				runs(() => expect(addRepoForTeam).toHaveBeenCalledWith(team1.id));
			});

			describe("server errors", () => {
				const view = mountWithIntl(
					<Provider store={store}>
						<TeamSelectionForm />
					</Provider>
				);

				describe("when the team does not exist", () => {
					it("shows an error", () => {
						store.dispatch(teamNotFound());
						view.update();
						expect(view.find(".error-message").text()).toBe("The selected team doesn't exist.");
					});
				});

				describe("when the user is not on the selected team", () => {
					it("shows an error", () => {
						store.dispatch(noPermission());
						view.update();
						expect(view.find(".error-message").text()).toBe(
							"You are not a member of the selected team."
						);
					});
				});
			});
		});

		describe("when the user is creating a new team", () => {
			it("calls the createTeam function with the provided name", () => {
				const createTeam = jasmine.createSpy("createTeam stub").andReturn(Promise.resolve());
				const view = mountWithIntl(
					<Provider store={store}>
						<SimpleTeamSelectionForm createTeam={createTeam} teams={[]} errors={{}} />
					</Provider>
				);
				const newTeamName = "Bar Baz";

				view.find("#name-input").simulate("change", { target: { value: newTeamName } });
				view.find("form").simulate("submit");

				waitsFor(() => createTeam.callCount > 0);
				runs(() => expect(createTeam).toHaveBeenCalledWith(newTeamName));
			});
		});
	});
});
