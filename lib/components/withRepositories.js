import React from "react";
import PropTypes from "prop-types";

export default Child => {
	class RepositoryProvider extends React.Component {
		static contextTypes = {
			repositories: PropTypes.array
		};

		render() {
			return React.cloneElement(React.Children.only(this.props.children), {
				repositories: this.context.repositories
			});
		}
	}
	return props => (
		<RepositoryProvider>
			<Child {...props} />
		</RepositoryProvider>
	);
};
