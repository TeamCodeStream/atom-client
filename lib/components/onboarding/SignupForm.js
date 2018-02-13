import { shell } from "electron";
import React, { Component } from "react";
import { FormattedMessage } from "react-intl";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import getSystemUser from "username";
import Button from "./Button";
import Tooltip from "../Tooltip";
import UnexpectedErrorMessage from "./UnexpectedErrorMessage";
import * as actions from "../../actions/onboarding";
const { CompositeDisposable } = require("atom");

const isUsernameInvalid = username => new RegExp("^[-a-z0-9_.]{1,21}$").test(username) === false;
const isPasswordInvalid = password => password.length < 6;
const isEmailInvalid = email => {
	const emailRegex = new RegExp(
		"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
	);
	return email === "" || emailRegex.test(email) === false;
};
const parseName = name => {
	const names = name.split(" ");
	if (names.length > 2) return { firstName: name, lastName: "" };
	else {
		const [firstName, lastName = ""] = names;
		return { firstName, lastName };
	}
};

export class SimpleSignupForm extends Component {
	static contextTypes = {
		repositories: PropTypes.array
	};

	constructor(props) {
		super(props);
		this.state = {
			username: getSystemUser.sync(),
			password: "",
			email: "",
			betaCode: "",
			usernameTouched: false,
			passwordTouched: false,
			emailTouched: false,
			telemetryConsent: true
		};
		this.subscriptions = new CompositeDisposable();
	}

	componentDidMount() {
		const { repositories } = this.context;
		const repository = repositories[0];
		const gitDirectory = repository.getWorkingDirectory();
		const defaultEmail = (this.defaultEmail = repository.getConfigValue(
			"user.email",
			gitDirectory
		));
		this.setState({
			email: defaultEmail || "",
			name: repository.getConfigValue("user.name", gitDirectory) || ""
		});
	}

	componentWillUnmount() {
		this.subscriptions.dispose();
	}

	onBlurUsername = () => {
		const { username } = this.state;
		this.setState({ usernameTouched: true });
	};

	onBlurPassword = () => {
		if (this.state.passwordTouched) return;
		this.setState({ passwordTouched: true });
	};

	onBlurEmail = () => {
		if (this.state.emailTouched) return;
		this.setState({ emailTouched: true });
	};

	renderUsernameHelp = () => {
		const { username, usernameInUse } = this.state;
		if (username.length > 21)
			return (
				<small className="error-message">
					<FormattedMessage id="signUp.username.length" />
				</small>
			);
		else if (isUsernameInvalid(username))
			return (
				<small className="error-message">
					<FormattedMessage id="signUp.username.validCharacters" />
				</small>
			);
		else if (this.props.errors.usernameInUse)
			return (
				<small className="error-message">
					<FormattedMessage id="signUp.username.alreadyTaken" />
				</small>
			);
		else return <small>&nbsp;</small>;
	};

	renderPasswordHelp = () => {
		const { password, passwordTouched } = this.state;
		if (isPasswordInvalid(password) && passwordTouched) {
			return (
				<small className="error-message">
					<FormattedMessage
						id="signUp.password.tooShort"
						values={{ countNeeded: 6 - password.length }}
					/>
				</small>
			);
		} else return <small>&nbsp;</small>;
	};

	renderEmailHelp = () => {
		const { email, emailTouched } = this.state;
		if (emailTouched && isEmailInvalid(email))
			return (
				<small className="error-message">
					<FormattedMessage id="signUp.email.invalid" />
				</small>
			);
		else return <small>&nbsp;</small>;
	};

	isFormInvalid = () => {
		const { username, password, email, betaCode } = this.state;
		return (
			isUsernameInvalid(username) ||
			isPasswordInvalid(password) ||
			isEmailInvalid(email) ||
			betaCode === ""
		);
	};

	submitCredentials = event => {
		event.preventDefault();
		if (this.isFormInvalid()) return;
		this.setState({ loading: true });
		const { register } = this.props;
		const { username, password, email, name, telemetryConsent, betaCode } = this.state;
		const preferences = { telemetryConsent };
		register({
			username,
			password,
			email,
			preferences,
			betaCode,
			...parseName(name)
		}).then(() => this.setState({ loading: false }));
	};

	handleTelemetryConsentChange = event => {
		const target = event.target;
		const value = target.type === "checkbox" ? target.checked : target.value;
		const name = target.name;

		this.setState({
			[name]: value
		});
	};

	renderDebugInfo() {
		const apiPath = sessionStorage.getItem("codestream.url");
		if (atom.inDevMode() && apiPath) return <p>{apiPath}</p>;
	}

	renderPageErrors() {
		if (this.props.errors.unknown)
			return <UnexpectedErrorMessage classes="error-message page-error" />;
		if (this.props.errors.invalidBetaCode)
			return <span className="error-message page-error">That's an invalid invitation code.</span>;
	}

	render() {
		return (
			<form id="signup-form" onSubmit={this.submitCredentials}>
				{this.renderDebugInfo()}
				<h2>Sign Up for CodeStream</h2>
				{this.renderPageErrors()}
				<div id="controls">
					<div id="email-controls" className="control-group">
						<label>
							<FormattedMessage id="signUp.email.label" />
						</label>
						<Tooltip
							title={`${this.defaultEmail ? "Defaulted from git" : ""}`}
							delay="0"
							placement="left"
						>
							<input
								className="native-key-bindings input-text"
								type="text"
								name="email"
								placeholder="Email Address"
								tabIndex="0"
								value={this.state.email}
								onChange={e => this.setState({ email: e.target.value })}
								onBlur={this.onBlurEmail}
							/>
						</Tooltip>
						{this.renderEmailHelp()}
					</div>
					<div id="username-controls" className="control-group">
						<label>
							<FormattedMessage id="signUp.username.label" />
						</label>
						<Tooltip
							title="Up to 21 characters. Valid special characters are (.-_)"
							delay="0"
							placement="left"
						>
							<input
								className="native-key-bindings input-text"
								type="text"
								name="username"
								placeholder="Username"
								minLength="1"
								maxLength="21"
								tabIndex="1"
								value={this.state.username}
								onChange={event => this.setState({ username: event.target.value })}
								onBlur={this.onBlurUsername}
							/>
						</Tooltip>
						{this.renderUsernameHelp()}
					</div>
					<div id="password-controls" className="control-group">
						<label>
							<FormattedMessage id="signUp.password.label" />
						</label>
						<Tooltip title="6+ characters" delay="0" placement="left">
							<input
								className="native-key-bindings input-text"
								type="password"
								name="password"
								tabIndex="2"
								value={this.state.password}
								onChange={e => this.setState({ password: e.target.value })}
								onBlur={this.onBlurPassword}
							/>
						</Tooltip>
						{this.renderPasswordHelp()}
					</div>
					<div id="invitation-code-controls" className="control-group">
						<label>
							<FormattedMessage id="invitationCode.label" defaultMessage="Invitation Code" />
						</label>
						<Tooltip title="Invitation code provided to your team" placement="left" delay="0">
							<input
								className="native-key-bindings input-text"
								type="text"
								tabIndex="3"
								value={this.state.betaCode}
								onChange={event => this.setState({ betaCode: event.target.value })}
							/>
						</Tooltip>
					</div>
					<Button
						id="signup-button"
						className="control-button"
						tabIndex="4"
						type="submit"
						loading={this.state.loading}
					>
						<FormattedMessage id="signUp.submitButton" />
					</Button>
					<small className="fine-print">
						<FormattedMessage id="signUp.legal.start" />{" "}
						<a onClick={() => shell.openExternal("https://codestream.com/tos")}>
							<FormattedMessage id="signUp.legal.termsOfService" />
						</a>{" "}
						<FormattedMessage id="and" />{" "}
						<a onClick={() => shell.openExternal("https://codestream.com/privacy")}>
							<FormattedMessage id="signUp.legal.privacyPolicy" />
						</a>
					</small>
					<small className="fine-print" id="telemetry-consent">
						<input
							id="telemetry-checkbox"
							className="control-checkbox"
							type="checkbox"
							name="telemetryConsent"
							onChange={this.handleTelemetryConsentChange}
							checked={this.state.telemetryConsent}
						/>
						<div className="telemetry-label">
							<FormattedMessage id="signUp.legal.telemetryConsent" />{" "}
							<a
								onClick={() =>
									shell.openExternal(
										"https://codestream.zendesk.com/hc/en-us/articles/115002759031"
									)
								}
							>
								<FormattedMessage id="signUp.legal.learnMore" />
							</a>
						</div>
					</small>
					<div className="footer">
						<p>
							<strong>
								<FormattedMessage id="signUp.footer.alreadySignedUp" />{" "}
								<a onClick={this.props.goToLogin}>
									<FormattedMessage id="signUp.footer.signIn" />
								</a>
							</strong>
						</p>
					</div>
				</div>
			</form>
		);
	}
}

const mapStateToProps = ({ onboarding }) => ({
	errors: onboarding.errors
});
export default connect(mapStateToProps, actions)(SimpleSignupForm);
