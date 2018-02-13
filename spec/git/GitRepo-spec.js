'use strict';

import expectPromise from '../helpers/expect-promise';
import os from 'os';
import path from 'path';
import nodegit from 'nodegit';
import { open as openRepo } from '../../lib/git/GitRepo';
import GitRepo from '../../lib/git/GitRepo';

const testRepoPath = path.resolve(__dirname, '..', '..', '..', 'TestRepo');
const tmpdir = os.tmpdir();
const commit1 = '5c255290f37247acb227d9d9e9595d32ef3eb786';
const commit2 = 'dfa7aeb2db7f5981a07c43f723d5e9df4724429c';
const commit3 = '1f2a13b7597f67f02ccf4089581f3d956dfea308';
const commit4 = '7d312dc8cb00194b0506077f3db0e1c9ad4ced2e';
const commit5 = '6aad7d350476b703a8cb616119fbc100476da25b';
const commit6 = '7c1e4d89c8d0fea47a9eafbdb80d64d1823a5676';

describe('GitRepo', () => {

	let git;
	let repo;

	beforeEach(() => {
		waitsForPromise(async () => {
			git = await nodegit.Repository.open(testRepoPath);
			git.setHeadDetached(commit2);
			repo = new GitRepo(git);
		});
	});

	describe('open()', () => {
		it('resolves to a GitRepo when path is valid', () => {
			waitsForPromise(async () => {
				const repo = await openRepo(testRepoPath);
				expect(repo).toBeDefined();
				expect(repo._git).toBeDefined();
			});
		});

		it('rejects when path does not exist', () => {
			waitsForPromise(async () => {
				const nonExistingPath = path.resolve(tmpdir, 'DoesNotExist');
				await expectPromise(openRepo(nonExistingPath)).toReject();
			});
		});

		it('rejects when path is not a Git repo', () => {
			waitsForPromise(async () => {
				const nonGitPath = tmpdir;
				await expectPromise(openRepo(nonGitPath)).toReject();
			});
		});
	});

	describe('getCurrentCommit()', () => {
		it('returns HEAD commit info', () => {
			waitsForPromise(async () => {
				let commit;

				commit = await repo.getCurrentCommit();
				expect(commit.hash).toBe(commit2);

				await repo._git.setHeadDetached(commit1);
				commit = await repo.getCurrentCommit();
				expect(commit.hash).toBe(commit1);
			});
		});
	});

	describe('getDeltas()', () => {
		it('returns filename information', () => {
			waitsForPromise(async () => {
				// Asserts that exists one and only one delta
				// for each specified filename. If a filename
				// is an array, asserts that file is identified
				// as renamed from filename[0] to filename[1].
				async function expectFilenames(...filenames) {
					const commit = await repo.getCurrentCommit();
					const deltas = await repo.getDeltas(commit);

					expect(deltas.length).toBe(filenames.length);

					for (let i = 0; i < filenames.length; i++) {
						const delta = deltas[i];
						const filename = filenames[i];
						let oldName, newName;
						if (Array.isArray(filename)) {
							oldName = filename[0];
							newName = filename[1];
						} else {
							oldName = newName = filename;
						}
						expect(delta.oldFile).toBe(oldName);
						expect(delta.newFile).toBe(newName);
					}
				}

				git.setHeadDetached(commit1);
				await expectFilenames('file1.js');

				git.setHeadDetached(commit2);
				await expectFilenames('file1.js');

				git.setHeadDetached(commit3);
				await expectFilenames('file2.js');

				git.setHeadDetached(commit4);
				await expectFilenames(['file2.js', 'file2renamed.js']);

				git.setHeadDetached(commit5);
				await expectFilenames('file3.js');

				git.setHeadDetached(commit6);
				await expectFilenames('file1.js', 'file3.js');
			});
		});

		it('returns edit information', () => {
			waitsForPromise(async () => {
				function expectEdits(actuals, expecteds) {
					expect(actuals.length).toBe(expecteds.length);
					for (let i = 0; i < actuals.length; i++) {
						const actual = actuals[i];
						const expected = expecteds[i];
						expect(actual.delStart).toBe(expected.delStart);
						expect(actual.addStart).toBe(expected.addStart);
						expect(actual.delLength).toBe(expected.delLength);
						expect(actual.addLength).toBe(expected.addLength);
					}
				}

				git.setHeadDetached(commit6);
				const commit = await repo.getCurrentCommit();
				const deltas = await repo.getDeltas(commit);
				expect(deltas.length).toBe(2);

				const file1Delta = deltas[0];
				expectEdits(file1Delta.edits, [
					{delStart: 2, addStart: 2, delLength: 1, addLength: 2},
					{delStart: 7, addStart: 8, delLength: 1, addLength: 2},
					{delStart: 13, addStart: 15, delLength: 0, addLength: 5},
					{delStart: 15, addStart: 22, delLength: 1, addLength: 1}
				]);

				const file3Delta = deltas[1];
				expectEdits(file3Delta.edits, [
					{delStart: 9, addStart: 9, delLength: 4, addLength: 0}
				]);
			});
		});
	});
});
