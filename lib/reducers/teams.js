import { toMapBy } from "./utils";

const initialState = {};

export default (state = initialState, { type, payload }) => {
	switch (type) {
		case "BOOTSTRAP_TEAMS":
			return toMapBy("id", payload);
		case "ADD_TEAMS":
			return { ...state, ...toMapBy("id", payload) };
		case "TEAMS-UPDATE_FROM_PUBNUB":
		case "ADD_TEAM":
			return { ...state, [payload.id]: payload };
		default:
			return state;
	}
};
