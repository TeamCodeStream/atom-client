import React, { Component } from "react";
import Gravatar from "react-gravatar";
import createClassString from "classnames";

export default class Headshot extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		let image = this._div.querySelector("img");
		if (image) {
			if (this.props.mine) {
				atom.tooltips.add(image, { title: "Right click to change your headshot" });
			} else if (this.props.person.fullName) {
				atom.tooltips.add(image, { title: this.props.person.fullName });
			}
		}
	}

	render() {
		const person = this.props.person;

		if (!person) return null;

		let defaultImage = encodeURI("https://i.imgur.com/hOylzTJ.gif");
		let authorInitials = person.email.charAt(0);
		if (person.fullName) {
			authorInitials = person.fullName.replace(/(\w)\w*/g, "$1").replace(/\s/g, "");
			if (authorInitials.length > 2) authorInitials = authorInitials.substring(0, 2);
		}
		let classNameInitials = "headshot-initials color-" + person.color;

		return (
			<div className="headshot" ref={ref => (this._div = ref)}>
				<Gravatar
					className="headshot-gravatar"
					size={this.props.size}
					default={defaultImage}
					protocol="http://"
					email={person.email}
				/>
				<div className={classNameInitials}>{authorInitials}</div>
			</div>
		);
	}
}
