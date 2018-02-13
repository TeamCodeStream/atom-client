import React, { Component } from "react";
import { FormattedMessage } from "react-intl";
import { connect } from "react-redux";
import UnexpectedErrorMessage from "./UnexpectedErrorMessage";
import Button from "./Button";
import Tooltip from "../Tooltip";
import * as onboardingActions from "../../actions/onboarding";

export class ChangeUsernameForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			username: "",
			touched: false,
			loading: false
		};
	}

	onBlur = () => this.setState({ touched: true });

	renderError = () => {
		if (this.props.errors.unknown)
			return <UnexpectedErrorMessage classes="error-message page-error" />;
	};

	isFormInvalid() {
		return new RegExp("^[-a-z0-9_.]{1,21}$").test(this.state.username) === false;
	}

	onSubmit = async event => {
		event.preventDefault();
		if (this.isFormInvalid()) return;
		this.setState({ loading: true });
		await this.props.changeUsername(this.state.username);
		await this.props.joinTeam(this.props.nextAction);
		this.setState({ loading: false });
	};

	renderUsernameHelp = () => {
		const { username, touched } = this.state;
		if (touched && username.length === 0)
			return (
				<small className="error-message">
					<FormattedMessage id="changeUsername.empty" defaultMessage="Required" />
				</small>
			);
		if (touched && this.isFormInvalid())
			return (
				<small className="error-message">
					<FormattedMessage id="signUp.username.validCharacters" />
				</small>
			);
	};

	render() {
		return (
			<form id="change-username-form" onSubmit={this.onSubmit}>
				<h2>
					<FormattedMessage id="changeUsername.title" defaultMessage="Username Collision!" />
				</h2>
				<p>
					<FormattedMessage
						id="changeUsername.message"
						defaultMessage={`Bad news. Someone on this team already has \"{takenUsername}\" as a username. Unfortunately, you'll have to change yours.`}
						values={{ takenUsername: this.props.takenUsername }}
					/>
				</p>
				{this.renderError()}
				<div id="controls">
					<div id="username-controls" className="control-group">
						<Tooltip
							title="Up to 21 characters. Valid special characters are (.-_)"
							delay="0"
							placement="left"
						>
							<input
								id="change-username"
								className="native-key-bindings input-text control"
								type="text"
								name="username"
								placeholder="Username"
								minLength="1"
								maxLength="21"
								tabIndex="0"
								value={this.state.username}
								onBlur={this.onBlur}
								onChange={event => this.setState({ username: event.target.value })}
							/>
						</Tooltip>
						{this.renderUsernameHelp()}
					</div>
					<Button
						id="submit-button"
						className="control-button"
						tabIndex="2"
						type="submit"
						loading={this.state.loading}
					>
						<FormattedMessage id="changeUsername.submitButton" defaultMessage="UPDATE" />
					</Button>
				</div>
			</form>
		);
	}
}

const mapStateToProps = ({ onboarding }) => ({
	...onboarding.props,
	errors: onboarding.errors
});
export default connect(mapStateToProps, onboardingActions)(ChangeUsernameForm);
