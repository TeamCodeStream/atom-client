const initialState = {
	complete: false,
	requestInProcess: false,
	firstTimeInAtom: false,
	step: "signUp",
	props: {},
	errors: {}
};

export default (state = initialState, { type, payload }) => {
	switch (type) {
		case "REQUEST_STARTED":
			return { ...state, requestInProcess: true };
		case "REQUEST_FINISHED":
			return { ...state, requestInProcess: false };
		case "GO_TO_CONFIRMATION":
		case "SIGNUP_SUCCESS":
			return { ...state, step: "confirmEmail", props: payload };
		case "SIGNUP_EMAIL_EXISTS":
			return { ...state, step: "login", props: payload };
		case "GO_TO_LOGIN":
			return { ...initialState, step: "login" };
		case "GO_TO_SIGNUP":
			return { ...initialState, step: "signUp" };
		case "SIGNUP-USERNAME_COLLISION":
			return { ...state, errors: { usernameInUse: true } };
		case "NEW_USER_LOGGED_INTO_NEW_REPO":
			return { ...initialState, step: "createTeam" };
		case "NEW_USER_CONFIRMED_IN_NEW_REPO":
			return { ...initialState, step: "createTeam", firstTimeInAtom: true };
		case "EXISTING_USER_LOGGED_INTO_NEW_REPO":
			return { ...initialState, step: "selectTeam" };
		case "EXISTING_USER_CONFIRMED_IN_NEW_REPO":
			return { ...initialState, step: "selectTeam", firstTimeInAtom: true };
		case "LOGGED_INTO_FOREIGN_REPO":
			return { ...initialState, step: "noAccess" };
		case "EXISTING_USER_CONFIRMED_IN_FOREIGN_REPO":
			return { ...initialState, step: "noAccess", firstTimeInAtom: true };
		case "USER_ALREADY_CONFIRMED":
			return { ...initialState, step: "login", props: payload };
		case "EXISTING_USER_CONFIRMED":
			return { ...initialState, complete: true, firstTimeInAtom: true };
		case "INVALID_CONFIRMATION_CODE":
			return { ...state, errors: { invalidCode: true } };
		case "EXPIRED_CONFIRMATION_CODE":
			return { ...state, errors: { expiredCode: true } };
		case "CREATE_TEAM-INVALID_REPO_URL":
			return { ...state, errors: { invalidRepoUrl: true } };
		case "TEAM_CREATED":
			return { ...state, step: "identifyMembers", props: payload };
		case "TEAM_NOT_FOUND":
			return { ...state, errors: { teamNotFound: true } };
		case "INVALID_PERMISSION_FOR_TEAM":
			return { ...state, errors: { noPermission: true } };
		case "REPO_ADDED_FOR_TEAM":
			return {
				...initialState,
				step: "identifyMembers",
				props: { existingTeam: true, teamName: payload }
			};
		case "INVALID_CREDENTIALS":
			return { ...state, errors: { invalidCredentials: true } };
		case "INVALID_BETA_CODE":
			return { ...state, errors: { invalidBetaCode: true } };
		case "USERNAME_COLLISION_ON_TEAM":
			return { ...state, step: "changeUsername", props: payload };
		case "LOGGED_IN":
		case "ONBOARDING_COMPLETE":
			return { ...initialState, firstTimeInAtom: state.firstTimeInAtom, complete: true };
		case "RESET_ONBOARDING":
			return initialState;
		case "ONBOARDING-SERVER_UNREACHABLE":
			return { ...state, errors: { unknown: true } };
		default:
			return state;
	}
};
