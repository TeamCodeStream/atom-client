import { CompositeDisposable } from "atom";
import React, { Component } from "react";
import { connect } from "react-redux";
import _ from "underscore-plus";
import * as actions from "../actions/marker-location";
import { locationToRange } from "../util/Marker";
import rootLogger from "../util/Logger";

const isValid = location => {
	const sameLine = location[0] === location[2];
	const startOfLine = location[1] === 0 && location[3] === 0;
	return !(sameLine && startOfLine);
};

class ReferenceBubble extends Component {
	subscriptions = new CompositeDisposable();

	constructor(props) {
		super(props);
		this.state = {
			isVisible: isValid(props.location)
		};
		this.logger = rootLogger.forObject("components/ReferenceBubble");
	}

	componentDidMount() {
		this.logger.trace(".componentDidMount");
		const { location, editor } = this.props;
		const subscriptions = this.subscriptions;
		const range = locationToRange(location);
		const marker = (this.marker = editor.markBufferRange(range, {
			invalidate: "never"
		}));

		subscriptions.add(
			marker.onDidDestroy(() => {
				subscriptions.dispose();
			})
		);
	}

	componentWillUnmount() {
		this.logger.trace(".componentWillUnmount");
		this.marker.destroy();
		this.subscriptions.dispose();
	}

	render() {
		this.logger.trace(".render");
		if (!this.state.isVisible) return false;

		const { id, postId, onSelect, count, numComments } = this.props;
		return (
			<div onClick={e => onSelect(postId)} key={id} className={`count-${count}`}>
				{numComments > 9 ? "9+" : numComments}
			</div>
		);
	}
}

export default connect(null, actions)(ReferenceBubble);
