import { incrementUMI } from "./actions/umi";

export default store => next => action => {
	const { context } = store.getState();
	if (action.type === "POSTS-UPDATE_FROM_PUBNUB") {
		store.dispatch(incrementUMI(action.payload));
	}
	return next(action);
};
