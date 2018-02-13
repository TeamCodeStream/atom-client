export const lastMessageReceived = timeToken => ({
	type: "LAST_MESSAGE_RECEIVED",
	payload: timeToken
});

export const resetMessaging = () => ({
	type: "RESET_MESSAGING"
});

export const subscriptionFailure = channel => ({
	type: "SUBSCRIPTION_FAILURE",
	payload: channel
});

export const subscriptionSuccess = channel => ({
	type: "SUBSCRIPTION_SUCCESS",
	payload: channel
});

export const subscriptionTimedOut = () => ({ type: "SUBSCRIPTION_TIMEOUT" });

export const historyRetrievalFailure = () => ({ type: "HISTORY_RETRIEVAL_FAILURE" });

export const catchingUp = () => ({ type: "CATCHING_UP" });

export const caughtUp = () => ({ type: "CAUGHT_UP" });

export const grantAccess = channel => async (dispatch, getState, { db, http }) => {
	return http.put(`/grant/${channel}`, {}, getState().session.accessToken);
};
