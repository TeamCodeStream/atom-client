import React from "react";
import Enzyme, { render } from "enzyme";
import { Provider } from "react-redux";
import Adapter from "enzyme-adapter-react-16";
import { mountWithIntl } from "./intl-test-helper.js";
import LoginForm, { SimpleLoginForm } from "../lib/components/onboarding/LoginForm";
import RepositoryProvider from "./RepositoryProvider";
import createStore from "../lib/createStore";

Enzyme.configure({ adapter: new Adapter() });

const store = createStore();
const repository = { getConfigValue: () => {}, getWorkingDirectory: () => {} };
const repositories = [repository];

// TODO: ignored because ToolTipManager jquery issues
xdescribe("LoginForm", () => {
	describe("Email address field", () => {
		const view = mountWithIntl(
			<Provider store={store}>
				<RepositoryProvider repositories={repositories}>
					<LoginForm />
				</RepositoryProvider>
			</Provider>
		);

		it("shows errors when left empty", () => {
			view.find('input[name="email"]').simulate("blur");
			expect(view.find('input[name="email"][required]').exists()).toBe(true);
		});

		it("shows errors when provided input is invalid", () => {
			view.find('input[name="email"]').simulate("change", { target: { value: "foo@" } });
			expect(view.find("#email-controls .error-message").text()).toBe(
				"Looks like an invalid email address!"
			);
		});

		it("uses 'Email Address' as the placeholder", () => {
			expect(view.find('input[name="email"]').prop("placeholder")).toBe("Email Address");
		});

		describe("when 'email' and 'alreadySignedUp' props are provided to the component", () => {
			const email = "foo@baz.com";
			const view = mountWithIntl(
				<SimpleLoginForm email={email} alreadySignedUp={true} configs={{}} errors={{}} />
			);
			it("is pre-populated with given email address", () => {
				expect(view.find('input[name="email"]').prop("value")).toBe(email);
			});

			it("there is a message about the user being already signed up", () => {
				expect(view.text()).toContain(
					"Looks like you're already signed up! Please enter your password."
				);
			});
		});
	});

	describe("Password field", () => {
		it("shows errors when left empty", () => {
			const view = mountWithIntl(
				<Provider store={store}>
					<RepositoryProvider repositories={repositories}>
						<LoginForm />
					</RepositoryProvider>
				</Provider>
			);
			view.find('input[name="password"]').simulate("blur");
			expect(view.find('input[name="password"][required]').exists()).toBe(true);
		});
	});

	describe("Sign In button", () => {
		const view = mountWithIntl(
			<Provider store={store}>
				<RepositoryProvider repositories={repositories}>
					<LoginForm />
				</RepositoryProvider>
			</Provider>
		);

		it("is disabled while the form values are invalid", () => {
			expect(view.find("Button").prop("disabled")).toBe(true);
		});

		it("is clickable while the form values are valid", () => {
			view.find('input[name="email"]').simulate("change", { target: { value: "foo@bar.com" } });
			view.find('input[name="password"]').simulate("change", { target: { value: "somePassword" } });

			expect(view.find("Button").prop("disabled")).toBe(false);
		});
	});

	describe("when valid credentials are submitted", () => {
		it("calls the authenticate function with the email and password", () => {
			const email = "foo@bar.com";
			const password = "somePassword";
			const authenticate = jasmine.createSpy("");
			const view = mountWithIntl(
				<RepositoryProvider repositories={repositories}>
					<SimpleLoginForm authenticate={authenticate} configs={{}} errors={{}} />
				</RepositoryProvider>
			);
			view.find('input[name="email"]').simulate("change", { target: { value: email } });
			view.find('input[name="password"]').simulate("change", { target: { value: password } });
			view.find("form").simulate("submit");

			waitsFor(() => authenticate.callCount > 0);
			runs(() => expect(authenticate).toHaveBeenCalledWith({ email, password }));
		});

		describe("when authentication fails", () => {
			it("shows an error", () => {
				const view = mountWithIntl(
					<RepositoryProvider repositories={repositories}>
						<SimpleLoginForm errors={{ invalidCredentials: true }} configs={{}} />
					</RepositoryProvider>
				);

				expect(view.find(".form-error").text()).toBe(
					"Sorry, you entered an incorrect email or password."
				);
			});
		});
	});
});
