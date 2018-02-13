import { shell } from "electron";
import React from "react";
import { FormattedMessage } from "react-intl";

export default props => (
	<span className={props.classes}>
		<FormattedMessage
			id="error.unexpected"
			defaultMessage="Something went wrong! Please try again, or "
		/>
		<a onClick={() => shell.openExternal("https://help.codestream.com")}>
			<FormattedMessage id="contactSupport" defaultMessage="contact support" />
		</a>
		.
	</span>
);
