export const dispatch = jasmine.createSpy("dispatch spy").andCallFake(() => {
	const action = dispatch.mostRecentCall.args[0];
	if (action.apply) return action(dispatch, null, { db });
	else return action;
});
