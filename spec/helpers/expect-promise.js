'use strict';

class ExpectPromise {
	constructor (promise) {
		this._promise = promise;
	}

	toResolve () {
		return this._promise;
	}

	toReject () {
		var me = this;
		return new Promise((res, rej) => {
			me._promise.then(rej, res);
		});
	}

	toThrow () {
		var me = this;
		return new Promise((res, rej) => {
			me._promise
				.then(rej, rej)
				.catch(err => res);
		});
	}
}

export default function expectPromise (promise) {
	return new ExpectPromise(promise);
};
