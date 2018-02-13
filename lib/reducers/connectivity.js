const initialState = {
	offline: !navigator.onLine
};

export default (state = initialState, { type }) => {
	switch (type) {
		case "OFFLINE":
			return { ...state, offline: true };
		case "ONLINE":
			return { ...state, offline: false };
		default:
			return state;
	}
	return state;
};
