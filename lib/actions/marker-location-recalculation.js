export const updateLastCalculationForFile = (path, hash) => ({
	type: "LOCATION_CALCULATED",
	payload: { path, hash }
});
