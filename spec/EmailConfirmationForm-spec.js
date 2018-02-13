import React from "react";
import { Provider } from "react-redux";
import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { mountWithIntl } from "./intl-test-helper.js";
import EmailConfirmationForm, {
	SimpleEmailConfirmationForm
} from "../lib/components/onboarding/EmailConfirmationForm";
import createStore from "../lib/createStore";

Enzyme.configure({ adapter: new Adapter() });

const store = createStore({ connectivity: { offline: false } });

describe("EmailConfirmationForm view", () => {
	describe("'Change it' link", () => {
		it("calls the goToSignup function", () => {
			const goToSignup = jasmine.createSpy();
			const view = mountWithIntl(
				<Provider store={store}>
					<SimpleEmailConfirmationForm goToSignup={goToSignup} errors={{}} />
				</Provider>
			);

			view.find("#go-back").simulate("click");

			expect(goToSignup).toHaveBeenCalled();
		});
	});

	describe("Submit button", () => {
		const view = mountWithIntl(
			<Provider store={store}>
				<SimpleEmailConfirmationForm errors={{}} />
			</Provider>
		);

		it("is disabled while the form is empty", () => {
			expect(view.find("Button").prop("disabled")).toBe(true);
		});

		it("is disabled while the form is invalid", () => {
			view.find("input").forEach((input, index) => {
				if (index < 3) input.simulate("change", { target: { value: "1" } });
			});
			expect(view.find("Button").prop("disabled")).toBe(true);
		});

		it("is enabled when the form is valid", () => {
			view.find("input").forEach(input => input.simulate("change", { target: { value: "1" } }));
			expect(view.find("Button").prop("disabled")).toBe(false);
		});
	});

	describe("valid form submission", () => {
		it("sends the userId, email, and code", () => {
			const confirmEmail = jasmine.createSpy("confirm email stub function");
			confirmEmail.andReturn(Promise.resolve());
			const email = "foo@bar.com";
			const userId = "12345";
			const view = mountWithIntl(
				<Provider store={store}>
					<SimpleEmailConfirmationForm
						confirmEmail={confirmEmail}
						email={email}
						userId={userId}
						errors={{}}
					/>
				</Provider>
			);
			view.find("input").forEach(input => input.simulate("change", { target: { value: "1" } }));
			view.find("form").simulate("submit");
			waitsFor(() => confirmEmail.callCount > 0);
			runs(() =>
				expect(confirmEmail).toHaveBeenCalledWith({ email, userId, confirmationCode: "111111" })
			);
		});
	});

	describe("when the submitted code is invalid", () => {
		it("shows an error message", () => {
			const view = mountWithIntl(
				<Provider store={store}>
					<SimpleEmailConfirmationForm errors={{ invalidCode: true }} />
				</Provider>
			);
			expect(view.find(".error-message").text()).toBe("Uh oh. Invalid code.");
		});
	});

	describe("when the submitted code has expired", () => {
		it("shows an error message", () => {
			const view = mountWithIntl(
				<Provider store={store}>
					<SimpleEmailConfirmationForm errors={{ expiredCode: true }} />
				</Provider>
			);
			expect(view.find(".error-message").text()).toBe("Sorry, that code has expired.");
		});
	});

	describe("when there is an unexpected error from server", () => {
		it("shows an error message", () => {
			const view = mountWithIntl(
				<Provider store={store}>
					<SimpleEmailConfirmationForm errors={{ unknown: true }} />
				</Provider>
			);
			expect(view.find(".error-message").text()).toBe(
				"Something went wrong! Please try again, or contact support."
			);
		});
	});

	describe("the link to send a new code", () => {
		it("calls the sendNewCode function with the right values", () => {
			const sendNewCode = jasmine.createSpy("sendNewCode stub").andReturn(Promise.resolve());
			const email = "foo@bar.com";
			const username = "foobar";
			const password = "foobar";
			const view = mountWithIntl(
				<Provider store={store}>
					<SimpleEmailConfirmationForm
						sendNewCode={sendNewCode}
						email={email}
						username={username}
						password={password}
						errors={{}}
					/>
				</Provider>
			);
			view.find("#send-new-code").simulate("click");
			waitsFor(() => sendNewCode.callCount > 0);
			runs(() => expect(sendNewCode).toHaveBeenCalledWith({ email, username, password }));
		});
	});
});
