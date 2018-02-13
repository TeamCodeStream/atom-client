export default class AddCommentPopup {
	constructor(props) {
		this.props = props;
		this.installHandlers();
	}

	installHandlers() {
		let editor = atom.workspace.getActiveTextEditor();
		if (editor && !editor.hasAddCommentPopupHandlers) {
			editor.onDidChangeSelectionRange(this.handleSelectionChange);
			editor.onDidChange(this.destroyMarker);
			editor.hasAddCommentPopupHandlers = true;
		}
		this.destroyMarker();
	}

	handleClick = () => {
		this.destroyMarker();
		return this.props.handleClickAddComment();
	};

	handleSelectionChange = event => {
		let editor = atom.workspace.getActiveTextEditor();
		if (!editor) return;

		this.destroyMarker();

		let code = editor.getSelectedText();
		if (code.length > 0) {
			this.addMarker(editor, editor.getSelectedBufferRange());
		}
	};

	addMarker(editor, range) {
		let row = range.start.row > range.end.row ? range.end.row : range.start.row;
		let startRange = [[row, 0], [row, 0]];
		this.marker = editor.markBufferRange(startRange, { invalidate: "touch" });
		let item = document.createElement("div");
		item.className = "codestream-comment-popup";
		let bubble = document.createElement("div");
		bubble.innerHTML = "+";
		item.appendChild(bubble);
		item.onclick = this.handleClick;
		editor.decorateMarker(this.marker, {
			type: "overlay",
			item: item,
			class: "codestream-overlay"
		});
		this.tooltip = atom.tooltips.add(item, { title: "Add a comment" });
	}

	destroyMarker = () => {
		if (!this.marker) return;

		this.marker.destroy();
		this.tooltip.dispose();
	};
}
