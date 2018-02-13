export const toMapBy = (key, entities) =>
	entities.reduce((result, entity) => ({ ...result, [entity[key]]: entity }), {});
