import { CompositeDisposable, File } from "atom";
import { Component } from "react";
import { connect } from "react-redux";
import * as markerLocationActions from "../actions/marker-location";
import * as markerLocationRecalculationActions from "../actions/marker-location-recalculation";
import { locationToRange, rangeToLocation } from "../util/Marker";
import { getStreamForRepoAndFile } from "../reducers/streams";

const isActiveEditor = editor => {
	const result = editor === atom.workspace.getActiveTextEditor();

	return result;
};

const isCalculationUpdated = async (path, editor, lastCalculation) => {
	const hash = await getContentHash(path);
	editor.lastHash = hash;
	const result = editor.displayMarkers && lastCalculation[path] === hash;

	return result;
};

const shouldRecalculateMarkers = async (editor, { currentFile, lastCalculation }) => {
	const result =
		!editor.isRecalculatingMarkers &&
		isActiveEditor(editor) &&
		!editor.getBuffer().isModified() &&
		!await isCalculationUpdated(currentFile, editor, lastCalculation);

	return result;
};

const getContentHash = async path => {
	const file = new File(path);
	const hash = await file.getDigest();

	return hash;
};

class MarkerLocationTracker extends Component {
	componentDidMount = () => {
		const subscriptions = (this.subscriptions = new CompositeDisposable());
		const editorsObserver = atom.workspace.observeTextEditors(this.editorOpened);
		subscriptions.add(editorsObserver);

		const { editor, streamId } = this.props;
		if (streamId) {
			this.recalculateMarkers(editor);
		}
	};

	componentWillReceiveProps(nextProps) {
		const { editor, markers } = nextProps;

		if (markers) {
			for (const { id, location } of markers) {
				this.createOrUpdateDisplayMarker(editor, {
					id,
					location
				});
			}
		}
	}

	componentDidUpdate = (prevProps, prevState) => {
		const { editor, streamId } = this.props;
		if (streamId && streamId != prevProps.streamId) {
			this.recalculateMarkers(editor);
		}
	};

	componentWillUnmount = () => {
		this.subscriptions.dispose();
	};

	editorOpened = editor => {
		this.subscriptions.add(
			editor.getBuffer().onDidReload(() => this.recalculateMarkers(editor)),
			editor.onDidStopChanging(() => this.saveDirtyMarkerLocations(editor))
		);
	};

	recalculateMarkers = async editor => {
		if (!await shouldRecalculateMarkers(editor, this.props)) {
			return;
		}

		editor.isRecalculatingMarkers = true;

		const {
			currentFile,
			teamId,
			streamId,
			calculateLocations,
			updateLastCalculationForFile
		} = this.props;
		updateLastCalculationForFile(currentFile, editor.lastHash);

		calculateLocations({ teamId, streamId });

		editor.isRecalculatingMarkers = false;
	};

	createOrUpdateDisplayMarker(editor, marker) {
		const displayMarkers = editor.displayMarkers || (editor.displayMarkers = {});
		const markerId = marker.id;
		const displayMarker = displayMarkers[markerId];
		const range = locationToRange(marker.location);

		if (displayMarker) {
			displayMarker.setBufferRange(range);
		} else {
			displayMarkers[markerId] = editor.markBufferRange(range);
		}
	}

	saveDirtyMarkerLocations(editor) {
		const { streamId, markerDirtied } = this.props;
		const displayMarkers = editor.displayMarkers;

		if (editor.isRecalculatingMarkers || !displayMarkers) {
			return;
		}

		for (const markerId of Object.keys(displayMarkers)) {
			const displayMarker = displayMarkers[markerId];
			const location = rangeToLocation(displayMarker.getBufferRange());
			markerDirtied({ markerId, streamId }, location);
		}
	}

	render = () => {
		return false;
	};
}

const mapStateToProps = state => {
	const { streams, context, markerLocationRecalculation } = state;
	const stream = getStreamForRepoAndFile(streams, context.currentRepoId, context.currentFile) || {};
	return {
		teamId: context.currentTeamId,
		streamId: stream.id,
		currentFile: context.currentFile,
		lastCalculation: markerLocationRecalculation
	};
};

export default connect(mapStateToProps, {
	...markerLocationActions,
	...markerLocationRecalculationActions
})(MarkerLocationTracker);
