import { CompositeDisposable } from "atom";
import React, { Component } from "react";

export default class AddCommentPopup extends Component {
	subscriptions = new CompositeDisposable();

	componentDidMount() {
		this.configure(this.props);
	}

	shouldComponentUpdate(nextProps) {
		return nextProps.editor.id !== this.props.editor.id;
	}

	componentDidUpdate() {
		this.configure(this.props);
	}

	componentWillUnmount() {
		this.reset();
	}

	configure(props) {
		this.subscriptions.add(props.editor.onDidChangeSelectionRange(this.handleSelectionChange));
	}

	handleSelectionChange = event => {
		const { editor } = this.props;
		const selectedLength = editor.getSelectedText().length;

		if (selectedLength === 0) return this.destroyMarker();

		const shouldAddMarker = !event.newBufferRange.isEqual(event.oldBufferRange);

		if (shouldAddMarker) {
			this.destroyMarker();
			const range = editor.getSelectedBufferRange();
			let row = range.start.row > range.end.row ? range.end.row : range.start.row;
			let startRange = [[row, 0], [row, 0]];
			this.marker = editor.markBufferRange(startRange, { invalidate: "touch" });
			this.marker.onDidChange(event => {
				if (event.isValid === false) this.destroyMarker();
			});
			let item = document.createElement("div");
			item.className = "codestream-comment-popup";
			let bubble = document.createElement("div");
			bubble.innerHTML = "+";
			item.appendChild(bubble);
			item.onclick = () => {
				this.props.onClick();
				this.destroyMarker();
			};
			editor.decorateMarker(this.marker, {
				item,
				type: "overlay",
				class: "codestream-overlay"
			});
			this.tooltip = atom.tooltips.add(item, { title: "Add a comment" });
		}
	};

	destroyMarker = () => {
		this.marker && this.marker.destroy();
		this.marker = null;
		this.tooltip && this.tooltip.dispose();
	};

	reset = () => {
		this.destroyMarker();
		this.subscriptions.dispose();
		this.subscriptions = new CompositeDisposable();
	};

	render() {
		return false;
	}
}
