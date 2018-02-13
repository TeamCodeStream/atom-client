import React, { Component } from "react";
import { FormattedMessage } from "react-intl";
import { connect } from "react-redux";
import Button from "./Button";
import UnexpectedErrorMessage from "./UnexpectedErrorMessage";
import * as actions from "../../actions/onboarding";

export class SimpleTeamSelectionForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedValue: "",
			newTeamName: ""
		};
	}

	isSelected = value => this.state.selectedValue === value;

	isFormInvalid = () => {
		const { selectedValue, newTeamName } = this.state;
		const noSelection = selectedValue === "";
		const noTeamName = selectedValue === "createTeam" && newTeamName === "";
		return noSelection || noTeamName;
	};

	onSelect = event => {
		const { value } = event.target;
		this.setState({ selectedValue: value });
		if (value === "createTeam") this.nameInput.focus();
	};

	onChange = event =>
		this.setState({ selectedValue: "createTeam", newTeamName: event.target.value });

	onSubmit = () => {
		if (this.isFormInvalid()) return;
		const { selectedValue, newTeamName } = this.state;

		if (selectedValue === "createTeam") this.props.createTeam(newTeamName);
		else this.props.addRepoForTeam(selectedValue);
	};

	renderError = () => {
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

	render() {
		return (
			<div id="team-selection">
				<h2>
					<FormattedMessage id="teamSelection.header" defaultMessage=" Select Team" />
				</h2>
				<p>
					<FormattedMessage
						id="teamSelection.whichTeam"
						defaultMessage="Which team owns this repo?"
					/>
				</p>
				<form onSubmit={this.onSubmit}>
					{this.renderError()}
					<div className="control-group">
						<label className="input-label">
							<input
								className="input-radio"
								type="radio"
								name="team"
								value="createTeam"
								checked={this.isSelected("createTeam")}
								onChange={this.onSelect}
							/>
							<FormattedMessage id="teamSelection.createTeam" defaultMessage="Create a new team" />
						</label>
						<input
							id="name-input"
							type="text"
							className="native-key-bindings input-text"
							placeholder="Team Name"
							required={this.isSelected("createTeam") && this.state.newTeamName === ""}
							value={this.state.newTeamName}
							onChange={this.onChange}
							ref={element => (this.nameInput = element)}
						/>
					</div>
					{this.props.teams.map((team, index) => {
						return (
							<div key={index} className="control-group">
								<label className="input-label">
									<input
										className="input-radio"
										type="radio"
										name="team"
										value={team.id}
										checked={this.isSelected(team.id)}
										onChange={this.onSelect}
									/>
									{team.name}
								</label>
							</div>
						);
					})}
					<Button id="submit-button" disabled={this.isFormInvalid()} loading={this.props.loading}>
						<FormattedMessage id="teamSelection.submitButton" defaultMessage="NEXT" />
					</Button>
				</form>
			</div>
		);
	}
}

const mapStateToProps = ({ onboarding, session, teams, users }) => {
	const currentUser = users[session.userId];
	return {
		teams: currentUser.teamIds.map(id => teams[id]),
		loading: onboarding.requestInProcess,
		errors: onboarding.errors
	};
};
export default connect(mapStateToProps, actions)(SimpleTeamSelectionForm);
