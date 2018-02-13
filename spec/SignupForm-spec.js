import React from "react";
import { Provider } from "react-redux";
import Enzyme, { render } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { mountWithIntl } from "./intl-test-helper.js";
import SignupForm, { SimpleSignupForm } from "../lib/components/onboarding/SignupForm";
import createStore from "../lib/createStore";
import RepositoryProvider from "./RepositoryProvider";
import { setContext } from "../lib/actions/context";

Enzyme.configure({ adapter: new Adapter() });

const store = createStore();
const repository = { getConfigValue: () => {}, getWorkingDirectory: () => {} };
const repositories = [repository];

// TODO: ignored because ToolTipManager jquery issues
xdescribe("SignupForm view", () => {
	describe("Username field", () => {
		const systemUser = "tommy";
		const view = mountWithIntl(
			<Provider store={store}>
				<RepositoryProvider repositories={repositories}>
					<SignupForm />
				</RepositoryProvider>
			</Provider>
		);

		xit("is pre-populated with the system username", () => {
			expect(view.find('input[name="username"]').prop("value")).toBe(systemUser);
		});

		it("uses 'Username' as the placeholder", () => {
			expect(view.find('input[name="username"]').prop("placeholder")).toBe("Username");
		});

		it("shows errors when left empty", () => {
			view.find('input[name="username"]').simulate("blur");
			expect(view.find('input[name="username"][required]').exists()).toBe(true);
		});

		it("shows errors when there are invalid characters", () => {
			const event = { target: { value: "foobar\\?^$" } };
			view.find('input[name="username"]').simulate("change", event);
			expect(view.find("#username-controls .error-message").text()).toContain("characters");
		});

		describe("when a username is already in use on a team", () => {
			it("shows errors on blur", () => {
				const view = mountWithIntl(
					<RepositoryProvider repositories={repositories}>
						<SimpleSignupForm errors={{ usernameInUse: true }} configs={{}} />
					</RepositoryProvider>
				);
				const event = { target: { value: "foobar" } };
				view.find('input[name="username"]').simulate("change", event);
				view.find('input[name="username"]').simulate("blur");
				expect(view.find("#username-controls .error-message").text()).toBe(
					"Sorry, someone on the team already grabbed that username."
				);
			});
		});
	});

	describe("Password field", () => {
		const view = mountWithIntl(
			<Provider store={store}>
				<RepositoryProvider repositories={repositories}>
					<SignupForm />
				</RepositoryProvider>
			</Provider>
		);

		it("shows errors when left empty", () => {
			view.find('input[name="password"]').simulate("blur");
			expect(view.find('input[name="password"][required]').exists()).toBe(true);
		});

		it("shows message when value is not long enough", () => {
			view.find('input[name="password"]').simulate("blur");
			view.find('input[name="password"]').simulate("change", { target: { value: "four" } });
			expect(view.find("#password-controls .error-message").text()).toBe(
				"2 more characters please"
			);
		});
	});

	describe("Email address field", () => {
		const view = mountWithIntl(
			<Provider store={store}>
				<RepositoryProvider repositories={repositories}>
					<SignupForm />
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

		describe("when an email address is in git config", () => {
			const email = "foo@bar.com";
			spyOn(repository, "getConfigValue").andReturn(email);
			const view = mountWithIntl(
				<Provider store={store}>
					<RepositoryProvider repositories={repositories}>
						<SignupForm />
					</RepositoryProvider>
				</Provider>
			);
			it("is pre-populated with given email address", () => {
				expect(view.find('input[name="email"]').prop("value")).toBe(email);
			});
		});
	});

	describe("Sign Up button", () => {
		const view = mountWithIntl(
			<Provider store={store}>
				<RepositoryProvider repositories={repositories}>
					<SignupForm />
				</RepositoryProvider>
			</Provider>
		);

		it("is disabled while the form values are invalid", () => {
			expect(view.find("Button").prop("disabled")).toBe(true);
		});

		it("is clickable while the form values are valid", () => {
			view.find('input[name="username"]').simulate("change", { target: { value: "f_oo-b7a.r" } });
			view.find('input[name="password"]').simulate("change", { target: { value: "somePassword" } });
			view.find('input[name="email"]').simulate("change", { target: { value: "foo@bar.com" } });

			expect(view.find("Button").prop("disabled")).toBe(false);
		});
	});

	describe("when valid credentials are submitted", () => {
		const email = "foo@bar.com";
		const username = "foobar";
		const password = "somePassword";
		const firstName = "Foo";
		const lastName = "Bar";
		const register = jasmine.createSpy("stub for register api").andReturn(Promise.resolve());

		describe("when the name in the git config is a simple two part name", () => {
			it("sends first and last name", () => {
				const name = `${firstName} ${lastName}`;
				spyOn(repository, "getConfigValue").andCallFake(() => {
					if (repository.getConfigValue.mostRecentCall.args[0] === "email") return "email";
					else return name;
				});
				const view = mountWithIntl(
					<RepositoryProvider repositories={repositories}>
						<SimpleSignupForm register={register} configs={{}} errors={{}} />
					</RepositoryProvider>
				);
				view.find('input[name="username"]').simulate("change", { target: { value: username } });
				view.find('input[name="password"]').simulate("change", { target: { value: password } });
				view.find('input[name="email"]').simulate("change", { target: { value: email } });

				view.find("form").simulate("submit");
				expect(register).toHaveBeenCalledWith({ email, username, password, firstName, lastName });
			});
		});

		describe("when the name in the git config is a single word", () => {
			it("sends the name as firstName", () => {
				spyOn(repository, "getConfigValue").andCallFake(() => {
					if (repository.getConfigValue.mostRecentCall.args[0] === "email") return "email";
					else return firstName;
				});
				const view = mountWithIntl(
					<RepositoryProvider repositories={repositories}>
						<SimpleSignupForm register={register} configs={{}} errors={{}} />
					</RepositoryProvider>
				);

				view.find('input[name="username"]').simulate("change", { target: { value: username } });
				view.find('input[name="password"]').simulate("change", { target: { value: password } });
				view.find('input[name="email"]').simulate("change", { target: { value: email } });

				view.find("form").simulate("submit");
				expect(register).toHaveBeenCalledWith({
					email,
					username,
					password,
					firstName,
					lastName: ""
				});
			});
		});

		describe("when the name provided is more than two words", () => {
			it("sends the name as firstName", () => {
				const name = "Foo Baz Bar";
				spyOn(repository, "getConfigValue").andCallFake(() => {
					if (repository.getConfigValue.mostRecentCall.args[0] === "email") return "email";
					else return name;
				});
				const view = mountWithIntl(
					<RepositoryProvider repositories={repositories}>
						<SimpleSignupForm register={register} configs={{}} errors={{}} />
					</RepositoryProvider>
				);
				view.find('input[name="username"]').simulate("change", { target: { value: username } });
				view.find('input[name="password"]').simulate("change", { target: { value: password } });
				view.find('input[name="email"]').simulate("change", { target: { value: email } });

				view.find("form").simulate("submit");
				expect(register).toHaveBeenCalledWith({
					email,
					username,
					password,
					firstName: name,
					lastName: ""
				});
			});
		});
	});

	describe("unexpected errors", () => {
		it("displays a message", () => {
			const view = mountWithIntl(
				<RepositoryProvider repositories={repositories}>
					<SimpleSignupForm configs={{}} errors={{ unknown: true }} />
				</RepositoryProvider>
			);

			expect(view.find(".page-error").text()).toBe(
				"Something went wrong! Please try again, or contact support."
			);
		});
	});
});
