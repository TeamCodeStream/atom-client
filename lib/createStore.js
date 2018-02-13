import { createStore, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import Raven from "raven-js";
import createRavenMiddleware from "raven-for-redux";
import reducer from "./reducers";
import pubnubMiddleWare from "./pubnub-middleware";
import umiMiddleWare from "./umi-middleware";
import db from "./local-cache";
import * as http from "./network-request";

export default (initialState = {}) => {
	return createStore(
		reducer,
		initialState,
		composeWithDevTools(
			applyMiddleware(
				thunkMiddleware.withExtraArgument({ db, http }),
				pubnubMiddleWare,
				umiMiddleWare,
				createRavenMiddleware(Raven, {
					stateTransformer: ({ context, session, repoAttributes, messaging }) => {
						return { context, session: { ...session, accessToken: "" }, repoAttributes, messaging };
					},
					getUserContext: ({ context, session, users }) => {
						if (session.userId) return users[session.userId];
					}
				})
			)
		)
	);
};
