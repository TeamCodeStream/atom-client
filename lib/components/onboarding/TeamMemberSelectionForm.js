import React, { Component } from "react";
import { FormattedMessage } from "react-intl";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import _ from "underscore-plus";
import Button from "./Button";
import UnexpectedErrorMessage from "./UnexpectedErrorMessage";
import git from "../../git";
import * as actions from "../../actions/onboarding";

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

export const parseCommitters = (strings, attrs = {}) => {
	const committers = _.uniq(strings)
		.filter(Boolean)
		.map(string => {
			const [name, email] = string.split("<trim-this>");
			if (email !== "" && email !== "(none)") return { name, email, ...attrs, ...parseName(name) };
			else return false;
		})
		.filter(Boolean);
	return _.uniq(committers, it => it.email);
};

export class SimpleTeamMemberSelectionForm extends Component {
	static contextTypes = {
		repositories: PropTypes.array
	};

	constructor(props) {
		super(props);
		this.state = {
			committers: [],
			loadingCommitters: true,
			addingMissingMember: false,
			newMemberInputTouched: false,
			newMemberEmail: ""
		};
	}

	async componentDidMount() {
		const repository = this.context.repositories[0];
		const cwd = repository.getWorkingDirectory();
		const logFormat = "--format=%an<trim-this>%ae";
		const cutoffDate = "6 months ago";
		const recentCommitterData = await git(["log", logFormat, `--since="${cutoffDate}"`], { cwd });
		const recentCommitters = parseCommitters(recentCommitterData.split("\n"), { selected: true });
		const olderCommitterData = await git(["log", logFormat, `--before="${cutoffDate}"`], { cwd });
		const olderCommitters = parseCommitters(olderCommitterData.split("\n"), {
			selected: false
		}).filter(committer => !_.findWhere(recentCommitters, { email: committer.email }));

		const committers = [...recentCommitters, ...olderCommitters].filter(
			c => !this.props.memberEmails.includes(c.email)
		);

		if (this.props.existingTeam && committers.length === 0) return this.props.completeOnboarding();

		this.setState({
			loadingCommitters: false,
			committers
		});
	}

	onChange = event => {
		const selectedEmail = event.target.value;
		this.setState(state => {
			return {
				committers: state.committers.map(committer => {
					if (committer.email === selectedEmail)
						return { ...committer, selected: !committer.selected };
					else return committer;
				})
			};
		});
	};

	onSubmitTeamMembers = () => {
		const newMembers = this.state.committers
			.filter(c => c.selected)
			.map(({ selected, name, ...rest }) => ({ ...rest }));
		if (newMembers.length === 0) this.props.completeOnboarding();
		else this.props.addMembers(newMembers);
	};

	toggleNewMemberInput = () =>
		this.setState(state => ({ addingMissingMember: !state.addingMissingMember }));

	renderSubmissionOfNewMembersError = () => {
		if (this.props.errors.teamNotFound)
			return (
				<p className="error-message">
					<FormattedMessage id="teamSelection.error.teamNotFound" />
				</p>
			);
		if (this.props.errors.noPermission)
			return (
				<p className="error-message">
					<FormattedMessage id="teamSelection.error.noPermission" />
				</p>
			);
		if (this.props.errors.unknown) return <UnexpectedErrorMessage classes="error-message" />;
	};

	renderInfo() {
		if (this.props.existingTeam)
			return (
				<p>
					<FormattedMessage
						id="teamMemberSelection.existingTeam.peopleToAdd"
						defaultMessage="Here are some people that have committed to this repo that you might want to add to {teamName}."
						values={{ teamName: this.props.teamName }}
					/>
				</p>
			);
		else
			return (
				<p>
					<FormattedMessage
						id="teamMemberSelection.newTeam.peopleToAdd"
						defaultMessage="Here are the people that have committed to this repo. Uncheck anyone no longer on the team."
					/>
				</p>
			);
	}

	renderSelectMembersForm() {
		return (
			<form className="select-members-form">
				{this.renderInfo()}
				{this.renderSubmissionOfNewMembersError()}
				<ul>
					{this.state.committers.map(committer => {
						return (
							<li key={committer.email}>
								<div className="block">
									<label className="input-label">
										<div className="input">
											<input
												className="input-checkbox"
												type="checkbox"
												value={committer.email}
												checked={committer.selected}
												onChange={this.onChange}
											/>
										</div>
										<div className="committer-info">
											<div className="committer-name">{committer.name}</div>
											<div>{committer.email}</div>
										</div>
									</label>
								</div>
							</li>
						);
					})}
				</ul>
				<div className="transforming-line">
					{this.state.addingMissingMember ? (
						this.renderNewInput()
					) : (
						<p className="help-text">
							<FormattedMessage
								id="teamMemberSelection.anyoneMissing"
								defaultMessage="Anyone missing?"
							/>{" "}
							<a onClick={this.toggleNewMemberInput}>
								<FormattedMessage id="teamMemberSelection.addThem" defaultMessage="Add them!" />
							</a>
						</p>
					)}
				</div>
			</form>
		);
	}

	onNewMemberChange = event => this.setState({ newMemberEmail: event.target.value });

	onNewMemberBlur = () => this.setState({ newMemberInputTouched: true });

	renderNewMemberError() {
		const { newMemberEmail, newMemberInputTouched } = this.state;
		if (newMemberInputTouched && isEmailInvalid(newMemberEmail))
			return (
				<span className="error-message">
					<FormattedMessage id="signUp.email.invalid" />
				</span>
			);
	}

	addNewMember = () => {
		this.setState(state => {
			const email = state.newMemberEmail;
			let newCommitters;
			if (_.findWhere(state.committers, { email })) {
				newCommitters = state.committers.map(
					committer => (committer.email === email ? { ...committer, selected: true } : committer)
				);
			} else {
				newCommitters = [{ email, selected: true }, ...state.committers];
			}
			return {
				committers: newCommitters,
				newMemberEmail: "",
				addingMissingMember: false,
				newMemberInputTouched: false
			};
		});
	};

	renderNewInput() {
		const { newMemberEmail, newMemberInputTouched } = this.state;
		return (
			<form className="add-member-form" onSubmit={this.addNewMember}>
				<div className="errors">{this.renderNewMemberError()}</div>
				<div className="control-group">
					<div>
						<input
							className="native-key-bindings input-text"
							type="email"
							placeholder="Enter email address"
							value={newMemberEmail}
							onChange={this.onNewMemberChange}
							onBlur={this.onNewMemberBlur}
							required={newMemberEmail === "" && newMemberInputTouched}
						/>
					</div>
					<Button disabled={newMemberEmail === ""}>
						<FormattedMessage id="teamMemberSelection.add" defaultMessage="ADD" />
					</Button>
				</div>
			</form>
		);
	}

	renderSpinner() {
		return (
			<div className="spinner">
				<span className="loading loading-spinner-small inline-block" />
			</div>
		);
	}

	renderContent() {
		let content;
		if (this.state.loadingCommitters) content = this.renderSpinner();
		if (this.state.committers.length === 0) content = this.renderNewInput();
		else content = this.renderSelectMembersForm();

		return [
			content,
			<Button
				id="submit-button"
				loading={this.props.serverLoading}
				onClick={this.onSubmitTeamMembers}
			>
				<FormattedMessage id="teamMemberSelection.submitButton" defaultMessage="GET STARTED" />
			</Button>
		];
	}

	render() {
		return (
			<div id="team-member-selection">
				<h2>
					<FormattedMessage id="teamMemberSelection.header" defaultMessage="Who's on the team?" />
				</h2>
				{this.renderContent()}
				<div className="footer">
					<FormattedMessage
						id="teamMemberSelection.footer"
						defaultMessage="We'll only send emails when you post messages."
					/>
				</div>
			</div>
		);
	}
}
const mapStateToProps = ({ session, onboarding, users, context, teams }) => {
	return {
		memberEmails: teams[context.currentTeamId].memberIds.map(id => users[id].email),
		serverLoading: onboarding.requestInProcess,
		errors: onboarding.errors
	};
};
export default connect(mapStateToProps, actions)(SimpleTeamMemberSelectionForm);
