import { toMapBy } from "./utils";

const initialState = {};

export default (state = initialState, { type, payload }) => {
	switch (type) {
		case "BOOTSTRAP_REPOS":
			return toMapBy("id", payload);
		case "ADD_REPOS":
			return { ...state, ...toMapBy("id", payload) };
		case "REPOS-UPDATE_FROM_PUBNUB":
		case "ADD_REPO":
			return { ...state, [payload.id]: payload };
		default:
			return state;
	}
};
