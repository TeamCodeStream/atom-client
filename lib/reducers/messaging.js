const initialState = {
	catchingUp: false,
	timedOut: false,
	failedSubscriptions: []
};

export default (state = initialState, { type, payload }) => {
	switch (type) {
		case "RESET_MESSAGING":
			return initialState;

		case "LAST_MESSAGE_RECEIVED":
			return { ...state, lastMessageReceived: payload };

		case "CATCHING_UP":
			return { ...state, catchingUp: true };

		case "CAUGHT_UP":
			return { ...state, catchingUp: false };

		case "SUBSCRIPTION_FAILURE":
			if (!state.failedSubscriptions || !state.failedSubscriptions.includes(payload)) {
				const nextState = {
					...state,
					failedSubscriptions: [...(state.failedSubscriptions || [])]
				};
				nextState.failedSubscriptions.push(payload);
				return nextState;
			}
			break;

		case "SUBSCRIPTION_SUCCESS":
			const index = (state.failedSubscriptions || []).indexOf(payload);
			if (index !== -1) {
				const nextState = {
					...state,
					failedSubscriptions: [...(state.failedSubscriptions || [])]
				};
				nextState.failedSubscriptions.splice(index, 1);
				return nextState;
			}
			break;

		case "SUBSCRIPTION_TIMEOUT":
			return { ...state, timedOut: true };

		case "HISTORY_RETRIEVAL_FAILURE":
			return { ...state, historyRetrievalFailure: true };
	}
	return state;
};
