export const PRODUCTION_URL = "https://api.codestream.com";

// Babel doesn't support extending native Objects like Error, Array, etc.
// so extending Error for custom errors is done the old fashioned way. https://github.com/chaijs/chai/issues/909
export function ApiRequestError(message, data) {
	Error.prototype.constructor.apply(this, arguments);
	this.data = data;
}

function ApiUnreachableError(message) {
	Error.prototype.constructor.apply(this, arguments);
}

export const isApiRequestError = error => error instanceof ApiRequestError;
export const isApiUnreachableError = error => error instanceof ApiUnreachableError;

const getPath = route => {
	const url = sessionStorage.getItem("codestream.url") || PRODUCTION_URL;
	return `${url}${route}`;
};

const getHeaders = () =>
	new Headers({
		Accept: "application/json",
		"Content-Type": "application/json"
	});

const tryFetch = async (url, config) => {
	try {
		const response = await fetch(url, config);
		const json = await response.json();
		if (response.ok) return json;
		else throw json;
	} catch (data) {
		if (data.message === "Failed to fetch" && navigator.onLine)
			throw new ApiUnreachableError(`Could not connect to ${url}`);
		else throw new ApiRequestError(data.message, data);
	}
};

export async function get(route, accessToken) {
	const headers = getHeaders();
	if (accessToken) {
		headers.set("Authorization", `Bearer ${accessToken}`);
	}
	return tryFetch(getPath(route), { headers });
}

export async function post(route, body, accessToken) {
	const headers = getHeaders();
	if (accessToken) {
		headers.set("Authorization", `Bearer ${accessToken}`);
	}
	return tryFetch(getPath(route), {
		headers,
		method: "POST",
		body: JSON.stringify(body)
	});
}

export async function put(route, body, accessToken) {
	const headers = getHeaders();
	if (accessToken) {
		headers.set("Authorization", `Bearer ${accessToken}`);
	}
	return tryFetch(getPath(route), {
		headers,
		method: "PUT",
		body: JSON.stringify(body)
	});
}

export async function deactivate(route, body, accessToken) {
	const headers = getHeaders();
	if (accessToken) {
		headers.set("Authorization", `Bearer ${accessToken}`);
	}
	return tryFetch(getPath(route), {
		headers,
		method: "DELETE",
		body: JSON.stringify(body)
	});
}

export default { get, post, put, deactivate, ApiRequestError };
