import { upsert } from "../local-cache";
import { normalize } from "./utils";

export const saveUser = attributes => (dispatch, getState, { db }) => {
	return upsert(db, "users", attributes).then(user =>
		dispatch({
			type: "ADD_USER",
			payload: user
		})
	);
};

export const saveUsers = attributes => (dispatch, getState, { db }) => {
	return upsert(db, "users", attributes).then(users =>
		dispatch({
			type: "ADD_USERS",
			payload: users
		})
	);
};

export const fetchCurrentUser = () => (dispatch, getState, { http }) => {
	const { session } = getState();
	return http
		.get("/users/me", session.accessToken)
		.then(data => dispatch(saveUser(normalize(data.user))));
};

export const setUserPreference = (prefPath, value) => (dispatch, getState, { http }) => {
	const { session, context, users } = getState();
	let user = users[session.userId];

	if (!user.preferences) user.preferences = {};
	let preferences = user.preferences;
	let newPreference = {};
	let newPreferencePointer = newPreference;
	while (prefPath.length > 1) {
		let part = prefPath.shift().replace(/\./g, "*");
		if (!preferences[part]) preferences[part] = {};
		preferences = preferences[part];
		newPreferencePointer[part] = {};
		newPreferencePointer = newPreferencePointer[part];
	}
	preferences[prefPath[0].replace(/\./g, "*")] = value;
	newPreferencePointer[prefPath[0].replace(/\./g, "*")] = value;

	console.log("Saving preferences: ", newPreference);
	http.put("/preferences", newPreference, session.accessToken);
	dispatch(saveUser(normalize(user)));
};

export const getUserPreference = (user, prefPath) => {
	if (!user) return null;
	if (!user.preferences) user.preferences = {};
	let preferences = user.preferences;
	while (prefPath.length > 0) {
		let part = prefPath.shift().replace(/\./g, "*");
		if (!preferences[part]) return null;
		preferences = preferences[part];
	}
	return preferences;
};
