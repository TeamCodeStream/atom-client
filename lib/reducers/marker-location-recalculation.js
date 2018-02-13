const initialState = {};

export default (state = initialState, { type, payload }) => {
	switch (type) {
		case "LOCATION_CALCULATED": {
			return {
				...state,
				[payload.path]: payload.hash
			}
		}
		default: return state;
	}
};
