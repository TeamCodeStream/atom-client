import React, { Component } from "react";
import createClassString from "classnames";
import Button from "./onboarding/Button";
import { locationToRange } from "../util/Marker";

export default class PostDetails extends Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.diffMarkers = [];
	}

	render() {
		const { post } = this.props;

		if (!post) return null;

		const applyPatchLabel = this.state.patchApplied ? "Revert" : "Apply Patch";
		const showDiffLabel = this.state.diffShowing ? "Hide Diff" : "Show Diff";
		const hasCodeBlock = post.codeBlocks && post.codeBlocks.length ? true : null;

		let alert = null;
		// if a patch has been applied, we treat it as if there is
		// a diff
		let showDiffButtons = this.state.patchApplied;
		if (post.markerLocation) {
			const code = post.codeBlocks[0].code;
			const editor = atom.workspace.getActiveTextEditor();
			if (editor) {
				const range = locationToRange(post.markerLocation);
				const existingCode = editor.getTextInBufferRange(range);
				if (code !== existingCode) {
					showDiffButtons = true;
				}
			}
		} else if (hasCodeBlock) {
			// this is the case where we have a codeblock but no marker location
			alert = <span className="icon icon-alert" ref={ref => (this._alert = ref)} />;
		}

		let commitDiv = null;
		if (hasCodeBlock) {
			commitDiv = (
				<div className="posted-to">
					<label>Posted to:</label> <span>{post.commitHashWhenPosted}</span>
				</div>
			);
			// if (post.commitHashWhenPosted == this.props.currentCommit) {
			// 	commitDiv = <span />;
			// } else {
			// 	commitDiv = (
			// 		<Button
			// 			id="show-version-button"
			// 			className="control-button"
			// 			tabIndex="2"
			// 			type="submit"
			// 			onClick={this.handleShowVersion}
			// 		>
			// 			Warp to {post.commitHashWhenPosted}
			// 		</Button>
			// 	);
			// }
		}

		return (
			<div className="post-details" id={post.id} ref={ref => (this._div = ref)}>
				{alert}
				{commitDiv}
				{showDiffButtons && (
					<div className="button-group">
						<Button
							id="show-diff-button"
							className="control-button"
							tabIndex="2"
							type="submit"
							loading={this.props.loading}
							onClick={this.handleClickShowDiff}
						>
							{showDiffLabel}
						</Button>
						<Button
							id="show-diff-button"
							className="control-button"
							tabIndex="2"
							type="submit"
							loading={this.props.loading}
							onClick={this.handleClickApplyPatch}
						>
							{applyPatchLabel}
						</Button>
					</div>
				)}
			</div>
		);
	}

	componentDidMount = () => {
		if (this._alert)
			atom.tooltips.add(this._alert, {
				title: "Unknown codeblock location."
			});
	};

	componentWillUnmount() {
		this.destroyDiffMarkers();
	}

	destroyDiffMarkers = () => {
		for (var i = 0; i < this.diffMarkers.length; i++) {
			this.diffMarkers[i].destroy();
		}
		this.diffMarkers = [];
	};

	scrollToLine = line => {
		const editor = atom.workspace.getActiveTextEditor();
		editor.setCursorBufferPosition([line, 0]);
		editor.scrollToBufferPosition([line, 0], {
			center: true
		});
	};

	handleShowVersion = async event => {
		console.log("Showing version...");
	};

	handleClickShowDiff = async event => {
		if (this.state.diffShowing) {
			this.destroyDiffMarkers();
		} else {
			const editor = atom.workspace.getActiveTextEditor();
			const post = this.props.post;
			const codeBlock = post.codeBlocks[0];

			const location = post.markerLocation;
			if (location) {
				const range = locationToRange(location);
				this.scrollToLine(range.start.row);

				const marker = editor.markBufferRange(range);
				editor.decorateMarker(marker, { type: "line", class: "git-diff-details-old-highlighted" });
				this.diffMarkers.push(marker);

				this.diffEditor = atom.workspace.buildTextEditor({
					lineNumberGutterVisible: false,
					scrollPastEnd: false
				});

				this.diffEditor.setGrammar(editor.getGrammar());
				this.diffEditor.setText(codeBlock.code.replace(/[\r\n]+$/g, ""));

				const diffDiv = document.createElement("div");
				diffDiv.appendChild(atom.views.getView(this.diffEditor));

				const marker2 = editor.markBufferRange(range);
				editor.decorateMarker(marker2, {
					type: "block",
					position: "after",
					item: diffDiv
				});
				this.diffMarkers.push(marker2);

				const marker3 = this.diffEditor.markBufferRange([[0, 0], [200, 0]]);
				this.diffEditor.decorateMarker(marker3, {
					type: "line",
					class: "git-diff-details-new-highlighted"
				});
				this.diffMarkers.push(marker3);
			}
		}
		this.setState({ diffShowing: !this.state.diffShowing });
	};

	handleClickApplyPatch = async event => {
		let editor = atom.workspace.getActiveTextEditor();
		const post = this.props.post;

		let location = post.markerLocation;
		if (location) {
			let range = [[location[0], location[1]], [location[2], location[3]]];

			this.scrollToLine(location[0]);

			if (this.state.patchApplied) {
				// revert
				editor.setTextInBufferRange(this.state.oldRange, this.state.oldCode);
			} else {
				// apply patch
				const codeBlock = post.codeBlocks[0];
				var currentCode = editor.getTextInBufferRange(range);
				let oldRange = editor.setTextInBufferRange(range, codeBlock.code);
				this.setState({ oldCode: currentCode, oldRange: oldRange });
			}
			this.setState({ patchApplied: !this.state.patchApplied });
		}
	};
}
