import sinon from "sinon";
import * as http from "../../lib/network-request";
import * as actions from "../../lib/actions/onboarding";

describe("onboarding action creators", () => {
	xdescribe("confirmEmail", () => {
		describe("when the confirmed user is not a member of the team for the current repo", () => {
			it("adds them to team", () => {
				const email = "foo@bar.com";
				spyOn(http, "post").andReturn(
					Promise.resolve({ accessToken: "", user: { email }, teams: [], repos: [] })
				);
				const dispatch = jasmine.createSpy("spy for dispatch");
				const getState = () => ({
					context: { currentTeamId: "1" }
				});

				waitsForPromise(async () => {
					await actions.confirmEmail({ email })(dispatch, getState, { http });
					// expect(actions.addMembers.calledWith([email])).toBe(true);
					expect(dispatch).toHaveBeenCalledWith({ type: "EXISTING_USER_CONFIRMED" });
				});
			});
		});
	});

	xdescribe("authenticate", () => {
		describe("when the authenticated user is not a member of the team for the current repo", () => {
			afterEach(() => http.put.restore());

			it("dispatches a no access action", () => {
				sinon
					.stub(http, "put")
					.returns(
						Promise.resolve({ accessToken: "", user: {}, teams: [{ _id: "teamId4" }], repos: [] })
					);
				const dispatch = jasmine.createSpy("spy for dispatch");

				actions.authenticate()(dispatch, () => ({ context: { currentTeamId: "1" } }));

				waitsFor(() => dispatch.callCount > 3);
				runs(() => {
					expect(dispatch).toHaveBeenCalledWith({ type: "LOGGED_INTO_FOREIGN_REPO" });
				});
			});
		});
	});
});
