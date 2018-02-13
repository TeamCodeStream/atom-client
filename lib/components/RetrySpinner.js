import { CompositeDisposable } from "atom";
import React from "react";

export default class RetrySpinner extends React.Component {
	state = { loading: false };
	mounted = false;
	tooltips = new CompositeDisposable();

	componentDidMount() {
		this.mounted = true;
		this.tooltips.add(
			atom.tooltips.add(this.retryIcon, { title: "Retry" }),
			atom.tooltips.add(this.cancelIcon, { title: "Cancel" })
		);
	}

	componentWillUnmount() {
		this.mounted = false;
		this.tooltips.dispose();
	}

	onRetry = async event => {
		event.stopPropagation();
		if (this.state.loading === false) {
			this.setState({ loading: true });
			await this.props.callback();
			if (this.mounted) this.setState({ loading: false });
		}
	};

	onCancel = event => {
		event.stopPropagation();
		this.props.cancel();
	};

	render() {
		return (
			<div className="retry-spinner">
				{this.state.loading ? (
					<span className="loading loading-spinner-tiny inline-block" />
				) : (
					[
						<span
							key="retry"
							ref={element => (this.retryIcon = element)}
							className="icon icon-sync text-error"
							onClick={this.onRetry}
						/>,
						<span
							key="cancel"
							ref={element => (this.cancelIcon = element)}
							className="icon icon-remove-close"
							onClick={this.onCancel}
						/>
					]
				)}
			</div>
		);
	}
}
