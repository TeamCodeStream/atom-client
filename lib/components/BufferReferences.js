import React, { Component } from "react";
import LineBubbleDecoration from "./LineBubbleDecoration";

export default class BufferReferences extends Component {
	state = { referencesByLine: {} };

	componentDidMount() {
		this.configureReferences(this.props.references);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.streamId !== this.props.streamId) {
			this.setState(
				() => ({ referencesByLine: {} }),
				() => this.configureReferences(nextProps.references)
			);
		} else this.configureReferences(nextProps.references);
	}

	configureReferences(references) {
		const referencesByLine = {};
		references.forEach(reference => {
			const line = reference.location[0];
			const lineMarkers = referencesByLine[line] || [];
			lineMarkers.push(reference);

			referencesByLine[line] = lineMarkers;
		});
		this.setState({ referencesByLine });
	}

	render() {
		const editor = atom.workspace.getActiveTextEditor();
		if (editor)
			// TODO: rather find the editor?
			return Object.keys(this.state.referencesByLine).map(line => (
				<LineBubbleDecoration
					key={line}
					line={line}
					editor={editor}
					references={this.state.referencesByLine[line]}
					position="tail"
					className="codestream-overlay"
					onSelect={this.props.onSelect}
				/>
			));
		else return false;
	}
}
