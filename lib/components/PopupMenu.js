import React, { Component } from "react";
import Gravatar from "react-gravatar";

// PopupMenu expects an on/off switch determined by the on property
// on = show the popup, off = hide the popup
export default class PopupMenu extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {}

	render() {
		if (!this.props.on) return "";

		const people = this.props.people;

		return (
			<div className="popup-menu" ref={ref => (this._div = ref)}>
				<div className="body">
					<div className="instructions" onClick={event => this.handleClickInstructions()}>
						{this.props.instructions}
					</div>
					<ul compact className="menu-list">
						{this.props.items.map(item => {
							let className = item.id == this.props.selected ? "hover" : "none";
							return (
								<li
									className={className}
									id={item.id}
									onMouseEnter={event => this.handleMouseEnter(item.id)}
									onClick={event => this.handleClickItem(item.id)}
								>
									<span class="label">{item.label}</span>{" "}
									<span class="shortcut">{item.shortcut}</span>
								</li>
							);
						})}
					</ul>
				</div>
			</div>
		);
	}

	handleMouseEnter(id) {
		return this.props.handleHoverMenuItem(id);
	}

	handleClickItem(id) {
		return this.props.handleSelectMenuItem(id);
	}

	handleClickInstructions() {
		// return this.props.handleSelectAtMention();
	}
}
