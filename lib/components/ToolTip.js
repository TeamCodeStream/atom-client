import React from "react";
import _ from "underscore-plus";

const tooltipOptions = ({ children, ...options }) => options;

export default class Tooltip extends React.Component {
	componentDidMount() {
		const { children, ...options } = this.props;
		this.configure(options);
	}

	componentDidUpdate(previousProps) {
		const currentOptions = tooltipOptions(this.props);
		if (!_.isEqual(tooltipOptions(previousProps), currentOptions)) {
			this.tearDown();
			this.configure(currentOptions);
		}
	}

	componentWillUnmount() {
		this.tearDown();
	}

	configure(options) {
		this.disposable = atom.tooltips.add(this.target, options);
	}

	tearDown() {
		this.disposable.dispose();
	}

	render() {
		const child = React.Children.only(this.props.children);
		return React.cloneElement(child, { ref: element => (this.target = element) });
	}
}
