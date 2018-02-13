import PubNubReceiver from "./pubnub-receiver";
import { fetchCurrentUser } from "./actions/user";
import { catchingUp, caughtUp, subscriptionFailure } from "./actions/messaging";
import Raven from "raven-js";

// TODO: this feels/is very fragile
let historyCount = 0;
let processedHistoryCount = 0;
let lastTick = null;
let ticksInitiated = false;
const _initiateTicks = (store, receiver) => {
	// start a ticking clock, look for anything that misses a tick by more than 10 seconds.
	// stuff like breakpoints, alerts, and context menu interactions will halt js processing and would cause ticking to stop, which could lead to false positives for wake events
	setInterval(async () => {
		if (!navigator.onLine) { 
			// don't bother until we are online
			Raven.captureBreadcrumb({
				message: "not online yet",
				category: "pubnub",
				data: { lastTick, now },
				level: "debug"
			});
			return; 
		}	
		const now = Date.now();
		if (lastTick && now - lastTick > 10000) {
			// we'll assume this is a laptop sleep event or something that otherwise
			// stopped execution for longer than expected ... we'll make sure we're
			// subscribed to the channels we need to be and fetch history to catch up,
			// in case we missed any messages
			Raven.captureBreadcrumb({
				message: "waking from sleep",
				category: "pubnub",
				data: { lastTick, now },
				level: "debug"
			});
			lastTick = now;
			receiver.unsubscribeAll();
			// restart the count for history processed
			processedHistoryCount = 0;
			historyCount = await _initializePubnubAndSubscribe(store, receiver);
		}
		else {
			lastTick = now;
		}
	}, 1000);
	ticksInitiated = true;
};

const _initializePubnubAndSubscribe = async (store, receiver, catchup = true) => {
	const { context, users, session, messaging } = store.getState();
	const user = users[session.userId];
	const teamChannels = (user.teamIds || []).map(id => `team-${id}`);

	const channels = [`user-${user.id}`, ...teamChannels];

	if (context.currentRepoId) {
		channels.push(`repo-${context.currentRepoId}`);
	}

	receiver.initialize(
		session.accessToken,
		session.userId,
		session.sessionId,
		session.pubnubSubscribeKey
	);
	receiver.subscribe(channels);
	if (!ticksInitiated) {
		_initiateTicks(store, receiver);
	}
	if (catchup) {
		store.dispatch(catchingUp());
		return receiver.retrieveHistory(channels, messaging);
	} else return 0;
};

export default store => {
	const receiver = new PubNubReceiver(store);

	return next => async action => {
		const result = next(action);

		if (action.isHistory) {
			processedHistoryCount += 1;
			if (processedHistoryCount === historyCount) {
				next(caughtUp());
				historyCount = processedHistoryCount = 0;
			}
		}
		// Once data has been loaded from indexedDB, if continuing a session,
		// find current user and subscribe to channels
		// fetch the latest version of the current user object
		if (action.type === "BOOTSTRAP_COMPLETE") {
			const { session, onboarding } = store.getState();
			if (onboarding.complete && session.accessToken) {
				store.dispatch(fetchCurrentUser());
				historyCount = await _initializePubnubAndSubscribe(store, receiver);
			}
		}
		// When starting a new session, subscribe to channels
		if (action.type === "LOGGED_IN" || action.type === "ONBOARDING_COMPLETE") {
			historyCount = await _initializePubnubAndSubscribe(store, receiver);
		}

		// Don't try to catchup when user is doing first onboarding
		if (
			action.type === "USER_CONFIRMED" ||
			action.type === "NEW_USER_LOGGED_INTO_NEW_REPO" ||
			action.type === "NEW_USER_CONFIRMED_IN_NEW_REPO" ||
			action.type === "EXISTING_USER_LOGGED_INTO_NEW_REPO"
		)
			_initializePubnubAndSubscribe(store, receiver, false);

		// As context changes, subscribe
		if (receiver.isInitialized()) {
			if (action.type === "SET_CONTEXT" && action.payload.currentRepoId)
				receiver.subscribe([`repo-${action.payload.currentRepoId}`]);
			if (action.type === "TEAM_CREATED") receiver.subscribe([`team-${action.payload.teamId}`]);
			if (action.type === "SET_CURRENT_TEAM") receiver.subscribe([`team-${action.payload}`]);
			if (action.type === "SET_CURRENT_REPO") receiver.subscribe([`repo-${action.payload}`]);
		}

		if (action.type === "CLEAR_SESSION") {
			receiver.unsubscribeAll();
		}

		// if we come online after a period of being offline, retrieve message history
		if (action.type === "ONLINE") {
			const { messaging } = store.getState();
			historyCount = await receiver.retrieveHistory(null, messaging);
		}

		return result;
	};
};
