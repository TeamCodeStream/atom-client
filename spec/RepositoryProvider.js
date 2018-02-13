import React, { Component, Children } from "react";
import PropTypes from "prop-types";

export default class RepositoryProvider extends Component {
	static childContextTypes = {
		repositories: PropTypes.array
	};

	getChildContext() {
		return {
			repositories: this.props.repositories
		};
	}

	render() {
		return Children.only(this.props.children);
	}
}
