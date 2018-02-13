import { toMapBy } from "./utils";

const initialState = {};

export default (state = initialState, { type, payload }) => {
	switch (type) {
		case "BOOTSTRAP_USERS":
			return toMapBy("id", payload);
		case "USERS-UPDATE_FROM_PUBNUB":
		case "ADD_USER":
			return { ...state, [payload.id]: payload };
		case "ADD_USERS":
			return { ...state, ...toMapBy("id", payload) };
		case "UPDATE_USER":
			return { ...state, [payload.id]: payload };
		default:
			return state;
	}
	return state;
};
