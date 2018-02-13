import { upsert } from "../local-cache";

export const resolveFromPubnub = (tableName, changes, isHistory = false) => (
	dispatch,
	getState,
	{ db }
) => {
	if (Array.isArray(changes))
		return Promise.all(
			changes.map(change => dispatch(resolveFromPubnub(tableName, change, isHistory)))
		);
	else
		return upsert(db, tableName, changes).then(record =>
			dispatch({
				type: `${tableName.toUpperCase()}-UPDATE_FROM_PUBNUB`,
				payload: record,
				isHistory
			})
		);
};
