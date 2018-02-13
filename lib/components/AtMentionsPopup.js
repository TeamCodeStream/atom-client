import React, { Component } from "react";
import Headshot from "./Headshot";

// AtMentionsPopup expects an on/off switch determined by the on property
// on = show the popup, off = hide the popup
// a people list, which is the possible list of people to at-mention
// with the format:
// [id, nickname, full name, email, headshot, presence]
// and a prefix, which is used to filter/match against the list
export default class AtMentionsPopup extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {}

	render() {
		if (!this.props.on) return null;

		const people = this.props.people;

		return (
			<div className="mentions-popup" ref={ref => (this._div = ref)}>
				<div className="body">
					<div className="instructions" onClick={event => this.handleClickInstructions()}>
						People matching <b>"@{this.props.prefix}"</b>
					</div>
					<ul className="compact at-mentions-list">
						{this.props.people.map(person => {
							let className = person.id == this.props.selected ? "hover" : "none";
							let identifier = person.username || person.email;
							// the handleClickPerson event needs to fire onMouseDown
							// rather than onclick because there is a handleblur
							// event on the parent element that will un-render
							// this component
							return (
								<li
									className={className}
									key={person.id}
									onMouseEnter={event => this.handleMouseEnter(person.id)}
									onMouseDown={event => this.handleClickPerson(person.id)}
								>
									<Headshot size={18} person={person} />
									<span className="username">{identifier}</span>{" "}
									<span className="name">
										{person.firstName} {person.lastName}
									</span>
								</li>
							);
						})}
					</ul>
					<table>
						<tbody>
							<tr>
								<td>&uarr; or &darr; to navigate</td>
								<td>&crarr; to select</td>
								<td>esc to dismiss</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		);
	}

	handleMouseEnter(id) {
		return this.props.handleHoverAtMention(id);
	}

	handleClickPerson(id) {
		return this.props.handleSelectAtMention(id);
	}

	handleClickInstructions() {
		return this.props.handleSelectAtMention();
	}

	handleClick = async event => {
		console.log("CLICK ON MENTION: " + event.target.innerHTML);
	};

	selectFirstAtMention() {
		// FIXME -- how to build this?
	}
}
