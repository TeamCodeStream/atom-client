import React from "react";
import { FormattedMessage } from "react-intl";

export default () => {
	return (
		<div id="no-git">
			<h2>
				<FormattedMessage id="noGit.header" />
			</h2>
			<h5>
				<FormattedMessage id="noGit.message" />
			</h5>
		</div>
	);
};
