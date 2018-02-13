import { shell } from "electron";
import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";
import { checkServerStatus } from "../actions/connectivity";

class OfflineBanner extends PureComponent {
	componentDidMount() {
		if (this.props.isOffline) this.startPolling();
	}

	componentDidUpdate(oldProps) {
		if (this.props.isOffline) this.startPolling();
		else this.stopPolling();
	}

	componentWillUnmount() {
		this.stopPolling();
	}

	startPolling = () => (this.interval = setInterval(this.props.checkServerStatus, 20000));

	stopPolling() {
		if (this.interval) clearInterval(this.interval);
	}

	render() {
		let content;
		if (this.props.hasSubscriptionIssues)
			content = (
				<p>
					<FormattedMessage
						id="offlineBanner.pubnub.struggling"
						defaultMessage="We're having issues connecting to streams..."
					/>
				</p>
			);
		if (this.props.isDisconnectedFromPubnub)
			content = (
				<p>
					<FormattedMessage
						id="offlineBanner.pubnub.main"
						defaultMessage="Oops...we couldn't connect to the streams."
					/>{" "}
					Try <a onClick={atom.reload.bind(atom)}>reloading</a>, or{" "}
					<a onClick={() => shell.openExternal("https://help.codestream.com")}>
						<FormattedMessage id="offlineBanner.pubnub.contact" defaultMessage="contact support" />
					</a>.
				</p>
			);
		// being offline is the overriding error
		if (this.props.isOffline)
			content = (
				<p>
					<FormattedMessage
						id="offlineBanner.offline.main"
						defaultMessage="You appear to be offline. We’ll try to reconnect you automatically, or you can "
					/>
					<a onClick={this.props.checkServerStatus}>
						<FormattedMessage id="offlineBanner.offline.tryAgain" defaultMessage="try again now" />
					</a>
					.
				</p>
			);

		if (content)
			return (
				<atom-panel id="offline-banner" class="padded">
					<div className="content">{content}</div>
				</atom-panel>
			);
		else return false;
	}
}

const mapStateToProps = ({ connectivity, messaging }) => ({
	isOffline: connectivity.offline,
	isDisconnectedFromPubnub: messaging.timedOut || messaging.historyRetrievalFailure,
	hasSubscriptionIssues: messaging.failedSubscriptions && messaging.failedSubscriptions.length > 0
});
export default connect(mapStateToProps, { checkServerStatus })(OfflineBanner);
