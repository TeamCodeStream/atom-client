import { CompositeDisposable } from "atom";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import ReferenceBubble from "./ReferenceBubble";
import { locationToRange } from "../util/Marker";
import rootLogger from "../util/Logger";

export default class LineBubbleDecoration extends Component {
	subscriptions = new CompositeDisposable();

	constructor(props) {
		super(props);
		this.logger = rootLogger.forObject("components/LineBubbleDecoration");
		this.item = document.createElement("div");
		this.item.classList.add("codestream-comment-popup");
		this.subscriptions.add(atom.tooltips.add(this.item, { title: "View comments" }));

		// if (reference.location[2] > maxLine) maxLine = reference.location[2] * 1;
		this.maxLine = props.references.reduce(
			(max, { location }) => (location[2] > max ? location[2] * 1 : max),
			props.line * 1
		);
	}

	componentDidMount() {
		this.decorate(this.props);
	}

	componentWillReceiveProps(nextProps) {
		this.tearDown();
		this.decorate(nextProps);
	}

	componentWillUnmount() {
		this.tearDown();
		this.subscriptions.dispose();
	}

	tearDown() {
		this.decoration && this.decoration.destroy();
		this.marker && this.marker.destroy();
		this.logger.destroy();
	}

	decorate(props) {
		const options = {
			type: "overlay",
			position: props.position,
			class: props.className,
			item: this.item
		};

		const { editor } = this.props;
		const subscriptions = this.subscriptions;
		const range = locationToRange([props.line, 1, this.maxLine + 1, 1]);
		const marker = (this.marker = editor.markBufferRange(range, {
			invalidate: "never"
		}));
		const decoration = (this.decoration = editor.decorateMarker(marker, options));

		subscriptions.add(
			editor.onDidDestroy(() => marker.destroy()),
			decoration.onDidDestroy(this.tearDownAndDisposeSubscriptions.bind(this)),
			marker.onDidDestroy(this.tearDownAndDisposeSubscriptions.bind(this))
		);
	}

	tearDownAndDisposeSubscriptions() {
		this.tearDown();
		this.subscriptions.dispose();
		this.subscriptions = new CompositeDisposable();
	}

	render() {
		return ReactDOM.createPortal(
			this.props.references.map((reference, index, group) => (
				<ReferenceBubble
					key={reference.id}
					editor={this.props.editor}
					onSelect={this.props.onSelect}
					count={group.length - index - 1}
					{...reference}
				/>
			)),
			this.item
		);
	}
}
