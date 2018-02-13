import React, { Component } from "react";
var moment = require("moment");
// var Moment_Timezone = require("moment-timezone");

export default class Timestamp extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		let timestampText = this.renderTimestamp(this.props.time);

		return <time>{timestampText}</time>;
	}

	sameDateAs(date1, date2) {
		return (
			date1.getFullYear() == date2.getFullYear() &&
			date1.getMonth() == date2.getMonth() &&
			date1.getDate() == date2.getDate()
		);
	}

	prettyDateDay = function(time, options) {
		options = options || {};
		if (time === 0 || time === null || time === undefined) return "";
		var now = new Date().getTime();
		// now = this.adjustedTime(now, options.timezone_info);
		// time = this.adjustedTime(time, options.timezone_info);
		var today = new Date(now);
		var timeDay = new Date(time);
		if (timeDay.getFullYear() === today.getFullYear()) {
			return moment(time).format("MMM D");
		}
		return moment(time).format("MMM D, YYYY");
	};

	prettyTime = function(time, options) {
		options = options || {};
		var prettyTime;
		// time = this.adjustedTime(time, options.timezone_info);
		prettyTime = moment(time).format("h:mm A");
		prettyTime = prettyTime.replace(/^0:/, "12:");
		return prettyTime;
	};

	renderTimestamp(time, options) {
		options = options || {};
		if (time === 0 || time === null || time === undefined) return "";
		var compTime = time;
		var now = new Date().getTime();
		// now = this.adjustedTime(now, options.timezoneInfo);
		// compTime = this.adjustedTime(compTime, options.timezoneInfo);
		var timestamp = "";
		var today = new Date(now);
		var timeDay = new Date(compTime);
		if (false && !this.sameDateAs(timeDay, today)) {
			timestamp +=
				this.prettyDateDay(time, {
					timezoneInfo: options.timezoneInfo,
					noYesterday: true
				}) + " ";
		}
		timestamp += this.prettyTime(time, options);
		return timestamp;
	}
}
