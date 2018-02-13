const normalizeObject = ({ _id, ...rest }) => {
	const result = { ...rest };
	if (_id) result.id = _id;
	return result;
};

export const normalize = data => {
	if (Array.isArray(data)) return data.map(normalizeObject);
	else return normalizeObject(data);
};
