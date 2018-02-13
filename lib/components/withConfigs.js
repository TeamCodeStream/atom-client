import React from "react";

export default function withConfigs(Child) {
	return props => (
		<ConfigProvider>
			{configs => {
				return <Child {...props} configs={configs} />;
			}}
		</ConfigProvider>
	);
}

const getConfigs = () => atom.config.get("codestream") || {};

class ConfigProvider extends React.Component {
	state = getConfigs();

	componentDidMount() {
		this.disposable = atom.config.onDidChange("codestream", event => {
			this.setState(getConfigs());
		});
	}

	componentWillUnmount() {
		this.disposable.dispose();
	}

	render() {
		return this.props.children({ ...this.state });
	}
}
