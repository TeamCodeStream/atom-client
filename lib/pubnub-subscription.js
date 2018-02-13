import {
	subscriptionFailure,
	subscriptionSuccess,
	subscriptionTimedOut,
	grantAccess
} from "./actions/messaging";
import Raven from "raven-js";

export default class PubnubSubscription {
	constructor(options) {
		Object.assign(this, options);
	}

	// are we subscribed (and confirmed subscribed) to this channel?
	isSubscribed() {
		return this._subscribed;
	}

	// subscribe to a channel with error handling and retries if it doesn't succeed
	subscribe() {
		this._numRetries = 0;
		if (this._subscribed) {
			// we're already subscribed, but we'll confirm that
			return this.confirmSubscription();
		}
		if (this._confirmationTimeout) {
			// we're already trying to subscribe
			return;
		}
		// time out after 5 seconds if we don't receive confirmation of the subscription
		this._confirmationTimeout = setTimeout(this.subscriptionTimedOut.bind(this), 5000);
		this.pubnub.subscribe({
			channels: [this.channel],
			withPresence: !this.channel.includes("user")
		});
		Raven.captureBreadcrumb({
			message: `Subscription to ${this.channel} initiated`,
			category: "pubnub",
			level: "info"
		});
	}

	// handle a status message
	status(status) {
		// check for a message indicating a successful subscription
		if (
			status.operation === "PNSubscribeOperation" &&
			status.category === "PNConnectedCategory" &&
			status.affectedChannels.includes(this.channel)
		) {
			clearTimeout(this._confirmationTimeout);
			delete this._confirmationTimeout;
			this._subscribed = true;
			Raven.captureBreadcrumb({
				message: `Subscription to ${this.channel} successful`,
				category: "pubnub",
				level: "info"
			});
			this.store.dispatch(subscriptionSuccess(this.channel));
		}
	}

	// called when we time out trying to subscribe, in which case we need to enter a failure mode
	async subscriptionTimedOut() {
		let now = new Date().toString();
		console.warn(`${now}: SUBSCRIPTION TO ${this.channel} TIMED OUT`);
		Raven.captureBreadcrumb({
			message: `Subscription to ${this.channel} timed out`,
			category: "pubnub",
			level: "warning"
		});
		delete this._confirmationTimeout;
		// announce the failure, the UX should do something with this
		Raven.captureMessage(`subscription failure: ${this.channel}`);
		this.store.dispatch(subscriptionFailure(this.channel));
		try {
			// in case it's an access problem, force the API server to give us access to this channel
			// if we have access, we'll try again, with several retries
			await this.store.dispatch(grantAccess(this.channel));
		} catch (error) {
			Raven.captureBreadcrumb({
				message: `Failed to get access to ${this.channel}: ${JSON.stringify(error)}`,
				category: "pubnub",
				level: "warning"
			});
			now = new Date().toString();
			console.warn(`${now}: ERROR GETTING ACCESS TO ${this.channel}: ${JSON.stringify(error)}`);
		}
		// now excuses now, try again, but give up completely after 10 tries
		this._numRetries++;
		if (this._numRetries < 10) {
			process.nextTick(this.subscribe.bind(this));
		} else {
			this.store.dispatch(subscriptionTimedOut());
			now = new Date().toString();
			console.warn(`${now}: GIVING UP SUBSCRIBING TO ${this.channel}, SOUND THE ALARMS`);
		}
	}

	// unsubscribe to the channel
	unsubscribe() {
		this._subscribed = false;
		this._numRetries = 0;
		if (this._confirmationTimeout) {
			clearTimeout(this._confirmationTimeout);
			delete this._confirmationTimeout;
		}
		Raven.captureBreadcrumb({
			message: `Unsubscribed to ${this.channel}`,
			category: "pubnub",
			level: "info"
		});
	}

	// confirm a subscription is still active by looking for this session in the occupants for the channel
	confirmSubscription() {
		const { session } = this.store.getState();
		const uuid = `${session.userId}/${session.sessionId}`;
		this.pubnub.hereNow(
			{
				channels: [this.channel],
				includeUUIDs: true
			},
			(status, response) => {
				if (
					status.error ||
					!response.channels[this.channel].occupants.find(occupant => occupant.uuid === uuid)
				) {
					const now = new Date().toString();
					console.warn(`${now}: UNABLE TO CONFIRM SUBSCRIPTION TO ${this.channel}`);
					Raven.captureBreadcrumb({
						message: `Unable to confirm subscription to ${this.channel}`,
						category: "pubnub",
						level: "warning"
					});
					return this.resubscribe();
				}
			}
		);
	}

	// resubscribe to the channel, as we were unable to confirm the subscription is active
	resubscribe() {
		this._subscribed = false;
		this.pubnub.unsubscribe([this.channel]);
		this.subscribe();
	}
}
