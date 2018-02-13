import React, { Component } from "react";
import { connect } from "react-redux";
import createClassString from "classnames";
import Headshot from "./Headshot";
import Timestamp from "./Timestamp";
import Menu from "./Menu";
import PostDetails from "./PostDetails";
import RetrySpinner from "./RetrySpinner";
import { retryPost, cancelPost } from "../actions/post";
import rootLogger from "../util/Logger";
import ContentEditable from "react-contenteditable";
import Button from "./onboarding/Button";

const logger = rootLogger.forClass("components/Post");

class Post extends Component {
	constructor(props) {
		super(props);
		this.state = {
			menuOpen: false
		};
	}

	componentDidMount() {
		// FIXME -- probably don't want to be doing something to parent here
		let streamDiv = this._div.parentNode.parentNode;
		let currentScroll = streamDiv.scrollTop;
		let scrollHeight = streamDiv.scrollHeight;
		let offBottom = scrollHeight - currentScroll - streamDiv.offsetHeight - this._div.offsetHeight;
		// if i am manually scrolling, don't programatically scroll to bottom
		// unless the post is mine, in which case we always scroll to bottom
		// we check to see if it's below 100 because if you are scrolled
		// almost to the bottom, we count that as being at the bottom for UX reasons
		if (offBottom < 100 || this.props.post.username === this.props.currentUsername) {
			// big number to make sure we've scrolled all the way down
			streamDiv.scrollTop = 100000;
			// console.log("SCROLLING TO BOTTOM");
		} else {
			// console.log("*********NOT SCROLLING TO BOTTOM");
		}

		// atom.tooltips.add($icon.get(0), {'title': 'This block of code is different than your current copy.'});
	}

	resubmit = () => this.props.retryPost(this.props.post.id);

	cancel = () => this.props.cancelPost(this.props.post.id);

	render() {
		const { post } = this.props;

		const mine = this.props.currentUsername === post.author.username;

		const postClass = createClassString({
			post: true,
			mine: mine,
			editing: this.props.editing,
			"new-separator": this.props.newMessageIndicator,
			[`thread-key-${this.props.threadKey}`]: true
		});

		let codeBlock = null;
		let alert = null;
		if (post.codeBlocks && post.codeBlocks.length) {
			let code = post.codeBlocks[0].code;
			codeBlock = <div className="code">{code}</div>;
		}

		logger.debug("UNR IS: ", this.props.usernames);
		// let menuItems = [
		// 	{ label: "Create Thread", key: "make-thread" },
		// 	{ label: "Mark Unread", key: "mark-unread" },
		// 	// { label: "Add Reaction", key: "add-reaction" },
		// 	// { label: "Pin to Stream", key: "pin-to-stream" },
		// 	{ label: "Edit Message", key: "edit-message" },
		// 	{ label: "Delete Message", key: "delete-message" }
		// ];

		// let menu = this.state.menuOpen ? (
		// <Menu items={menuItems} handleSelectMenu={this.handleSelectMenu} />
		// ) : null;

		let parentPost = this.props.replyingTo;
		let alertClass = this.props.alert ? "icon icon-" + this.props.alert : null;

		// this was above Headshot
		// <span className="icon icon-gear" onClick={this.handleMenuClick} />
		// {menu}

		return (
			<div
				className={postClass}
				id={post.id}
				thread={post.parentPostId || post.id}
				ref={ref => (this._div = ref)}
			>
				<Headshot size={36} person={post.author} mine={mine} />
				<span className="author" ref={ref => (this._authorDiv = ref)}>
					{post.author.username}
				</span>
				{post.error ? (
					<RetrySpinner callback={this.resubmit} cancel={this.cancel} />
				) : (
					<Timestamp time={post.createdAt} />
				)}
				<div className="body">
					{parentPost && (
						<div className="replying-to">
							<span>reply to</span> <b>{parentPost.text.substr(0, 80)}</b>
						</div>
					)}
					{codeBlock}
					{this.props.showDetails && (
						<PostDetails post={post} currentCommit={this.props.currentCommit} />
					)}
					{alertClass && <span className={alertClass} />}
					{this.props.editing ? this.renderEditingBody(post) : this.renderBody(post)}
				</div>
			</div>
		);
	}

	renderBody = post => {
		let usernameRegExp = new RegExp("(@(?:" + this.props.usernames + ")\\b)");
		let bodyParts = post.text.split(usernameRegExp);
		let iterator = 0;
		return bodyParts.map(part => {
			if (part.match(usernameRegExp)) {
				if (part === "@" + this.props.currentUsername)
					return (
						<span key={iterator++} className="at-mention me">
							{part}
						</span>
					);
				else
					return (
						<span key={iterator++} className="at-mention">
							{part}
						</span>
					);
			} else {
				return part;
			}
		});
	};

	renderEditingBody = post => {
		const id = "input-div-" + post.id;

		return (
			<div className="edit-post">
				<ContentEditable
					className="native-key-bindings"
					id={id}
					rows="1"
					tabIndex="-1"
					onChange={this.handleOnChange}
					onBlur={this.handleOnBlur}
					html={post.text}
					ref={ref => (this._contentEditable = ref)}
				/>
				<div className="button-group">
					<Button
						id="save-button"
						className="control-button"
						tabIndex="2"
						type="submit"
						loading={this.props.loading}
						onClick={this.handleClickSave}
					>
						Save Changes
					</Button>
					<Button
						id="discard-button"
						className="control-button cancel"
						tabIndex="2"
						type="submit"
						loading={this.props.loading}
						onClick={this.handleClickDiscard}
					>
						Discard
					</Button>
				</div>
			</div>
		);
	};

	componentDidUpdate(prevProps, prevState) {
		if (this.props.editing && !prevProps.editing) {
			document.getElementById("input-div-" + this.props.post.id).focus();
		}
	}

	handleMenuClick = async event => {
		event.stopPropagation();
		this.setState({ menuOpen: !this.state.menuOpen });
		console.log("CLICK ON MENU: ");
	};

	handleSelectMenu = (event, id) => {
		console.log("Clicked: " + id);
		event.stopPropagation();
		this.setState({ menuOpen: false });
	};
}

export default connect(null, { cancelPost, retryPost })(Post);
