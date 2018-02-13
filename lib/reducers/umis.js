import { toMapBy } from "./utils";
import _ from "underscore-plus";

const initialState = { mentions: {}, unread: {} };

export default (state = initialState, { type, payload }) => {
	switch (type) {
		case "INCREMENT_UMI": {
			// console.log("incrementint umis in the reducer: ", payload);
			let nextState = { ...state };
			nextState.unread[payload] = (nextState.unread[payload] || 0) + 1;
			// console.log("STATE IS: ", nextState);
			return nextState;
		}
		case "INCREMENT_MENTION": {
			// console.log("incrementing mention in the reducer: ", payload);
			// payload is a streamId
			let nextState = { ...state };
			nextState.mentions[payload] = (nextState.mentions[payload] || 0) + 1;
			nextState.unread[payload] = (nextState.unread[payload] || 0) + 1;
			return nextState;
		}
		case "CLEAR_UMI": {
			// console.log("clear umis in the reducer: ", payload);
			let nextState = { ...state };
			// instead of deleting it, we set it to zero
			// instead of deleting it, we set it to zero
			// so that when we loop through the keys we can
			// still reference the fact that this div needs to be cleared
			if (nextState.mentions[payload]) nextState.mentions[payload] = 0;
			if (nextState.unread[payload]) nextState.unread[payload] = 0;
			return nextState;
		}
		case "SET_UMI": {
			return payload;
		}
		case "RESET_UMI": {
			let nextState = { ...initialState };
			return nextState;
		}
		default:
			return state;
	}
	return state;
};
