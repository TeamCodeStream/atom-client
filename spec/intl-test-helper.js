/**
 * Components using the react-intl module require access to the intl context.
 * This is not available when mounting single components in Enzyme.
 * These helper functions aim to address that and wrap a valid,
 * English-locale intl context around them.
 */
import React from "react";
import { IntlProvider, intlShape } from "react-intl";
import { mount, shallow } from "enzyme";

const messages = require("../translations/en");

const intlProvider = new IntlProvider({ locale: "en", messages }, {});
const { intl } = intlProvider.getChildContext();

function nodeWithIntlProp(node) {
	return React.cloneElement(node, { intl });
}

export function shallowWithIntl(node, { context } = {}) {
	return shallow(nodeWithIntlProp(node), {
		context: Object.assign({}, context, { intl })
	});
}

export function mountWithIntl(node, { context, childContextTypes } = {}) {
	return mount(nodeWithIntlProp(node), {
		context: Object.assign({}, context, { intl }),
		childContextTypes: Object.assign({}, { intl: intlShape }, childContextTypes)
	});
}
