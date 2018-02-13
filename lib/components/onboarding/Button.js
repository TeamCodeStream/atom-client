import React from "react";
import { connect } from "react-redux";
import createClassString from "classnames";

Button.defaultProps = {
	className: "",
	disabled: false,
	loading: false
};
export function Button({ children, className, disabled, isOffline, loading, ...extras }) {
	const { dispatch, ...extraProps } = extras; // remove non-html attributes
	return (
		<button
			className={createClassString("native-key-bindings btn inline-block-tight", className, {
				"btn-primary": !loading
			})}
			disabled={isOffline || loading || disabled}
			{...extraProps}
		>
			{loading ? <span className="loading loading-spinner-tiny inline-block" /> : children}
		</button>
	);
}

export default connect(state => ({ isOffline: state.connectivity.offline }))(Button);

//dummy
