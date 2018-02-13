import React, { Component } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import { connect } from "react-redux";
import Button from "./Button";
import UnexpectedErrorMessage from "./UnexpectedErrorMessage";
import * as actions from "../../actions/onboarding";

export class SimpleEmailConfirmationForm extends Component {
	state = { values: ["", "", "", "", "", ""] };

	onChange = index => event => {
		const value = event.target.value;
		if (value === "" || isNaN(value) || value < 0) return;

		this.setState(
			state => {
				const values = state.values.slice();
				values[index] = Number(value);
				return { values };
			},
			() => {
				const nextInput = this[`input${index + 1}`];
				if (nextInput) nextInput.focus();
			}
		);
	};

	onPaste = event => {
		event.preventDefault();
		const clipped = atom.clipboard.read().split("");
		if (clipped.length === 6 && clipped.every(char => Number.isInteger(Number(char)))) {
			this.setState({ values: clipped }, () => {
				clipped.forEach((digit, index) => {
					this[`input${index}`].value = digit;
				});
			});
		}
	};

	submitCode = event => {
		event.preventDefault();
		const confirmationCode = this.state.values.join("");
		const { email, userId, transition, confirmEmail, store } = this.props;
		confirmEmail({ userId, email, confirmationCode });
		this.setState(
			state => {
				const values = state.values.slice();
				values.fill("");
				return { values };
			},
			() => {
				this.input0.focus();
				this.input0.value = "";
				this.input1.value = "";
				this.input2.value = "";
				this.input3.value = "";
				this.input4.value = "";
				this.input5.value = "";
			}
		);
	};

	isFormInvalid = () => this.state.values.includes("");

	renderError = () => {
		if (this.props.errors.invalidCode)
			return (
				<span className="error-message form-error">
					<FormattedMessage id="confirmation.invalid" />
				</span>
			);
		if (this.props.errors.expiredCode)
			return (
				<span className="error-message form-error">
					<FormattedMessage id="confirmation.expired" />
				</span>
			);
		else if (this.props.errors.unknown)
			return <UnexpectedErrorMessage classes="error-message form-error" />;
	};

	sendNewCode = () => {
		const { intl, username, email, password, sendNewCode } = this.props;
		sendNewCode({ username, email, password }).then(success => {
			if (success)
				atom.notifications.addInfo(
					intl.formatMessage({ id: "confirmation.emailSent", defaultMessage: "Email sent!" })
				);
		});
	};

	render() {
		const { email } = this.props;

		return (
			<form id="email-confirmation" onSubmit={this.submitCode}>
				<h2>
					<FormattedMessage id="confirmation.header" />
				</h2>
				<p>
					<FormattedMessage id="confirmation.instructions" />
				</p>
				<p>
					<FormattedMessage id="confirmation.didNotReceive" />{" "}
					<FormattedMessage id="confirmation.sendAnother">
						{text => (
							<a id="send-new-code" onClick={this.sendNewCode}>
								{text}
							</a>
						)}
					</FormattedMessage>
				</p>
				<p>
					<FormattedMessage id="confirmation.incorrectEmail" values={{ email }}>
						{text => {
							const [email, ...rest] = text.split(" ");
							return (
								<span>
									<strong>{email}</strong>
									{` ${rest.join(" ")} `}
								</span>
							);
						}}
					</FormattedMessage>
					<a id="go-back" onClick={this.props.goToSignup}>
						<FormattedMessage id="confirmation.changeEmail" />
					</a>
				</p>
				<div id="form">
					{this.renderError()}
					<div id="inputs">
						{this.state.values.map((_, index) => (
							<input
								className="native-key-bindings input-text"
								type="number"
								min="0"
								maxLength="1"
								tabIndex={index}
								ref={element => (this[`input${index}`] = element)}
								key={index}
								onChange={this.onChange(index)}
								onPaste={this.onPaste}
							/>
						))}
					</div>
					<Button
						id="submit-button"
						type="submit"
						disabled={this.isFormInvalid()}
						loading={this.props.loading}
					>
						<FormattedMessage id="confirmation.submitButton" />
					</Button>
				</div>
			</form>
		);
	}
}

const mapStateToProps = ({ onboarding }) => {
	const { userId, email, password, username } = onboarding.props;
	return {
		userId,
		attributesForNewCode: { email, password, username },
		errors: onboarding.errors,
		loading: onboarding.requestInProcess
	};
};
export default connect(mapStateToProps, actions)(injectIntl(SimpleEmailConfirmationForm));
