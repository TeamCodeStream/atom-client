import React from "react";
import { FormattedMessage } from "react-intl";

export default () => {
	return (
		<div id="too-much-git">
			<h2>
				<FormattedMessage id="tooMuchGit.header" defaultMessage="Too Many Repos!" />
			</h2>
			<h5>
				<FormattedMessage
					id="tooMuchGit.message"
					defaultMessage="We hate to mess up your workflow, but CodeStream doesn’t currently support having multiple repositories open in the same window. Support for this is coming soon, but for now you’ll need to open additional repositories in separate windows."
				/>
			</h5>
		</div>
	);
};
