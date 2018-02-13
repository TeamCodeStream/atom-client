'use strict';

class GitCommit {

	constructor(commit) {
		this._commit = commit;
	}

	get hash() {
		return this._commit.sha();
	}

	equals(that) {
		return this.hash === that.hash;
	}

	async getParent() {
		const parents = await this._commit.getParents(1);
		const parent = parents[0];
		return parent && new GitCommit(parent);
	}

}

export default GitCommit;
