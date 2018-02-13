import Raven from "raven-js";
import { normalize } from "./utils";
import { fetchRepoInfo, setCurrentRepo, setCurrentTeam, noAccess } from "./context";
import { saveUser, saveUsers } from "./user";
import { saveRepo, saveRepos } from "./repo";
import { fetchTeamMembers, saveTeam, saveTeams, joinTeam as _joinTeam } from "./team";
import { fetchStreams } from "./stream";
import { fetchLatestForCurrentStream } from "./post";
import UUID from "uuid/v1";

const logError = (message, error) => {
	Raven.captureException(error, { logger: "actions/onboarding" });
	console.error(message, error);
};

const requestStarted = () => ({ type: "REQUEST_STARTED" });
const requestFinished = () => ({ type: "REQUEST_FINISHED" });
const serverUnreachable = () => ({ type: "ONBOARDING-SERVER_UNREACHABLE" });
const invalidCredentials = () => ({ type: "INVALID_CREDENTIALS" });
const invalidBetaCode = () => ({ type: "INVALID_BETA_CODE" });
const loggedIn = () => ({ type: "LOGGED_IN" });
const usernameCollision = (takenUsername, nextAction) => ({
	type: "USERNAME_COLLISION_ON_TEAM",
	payload: { takenUsername, nextAction }
});

const userAlreadySignedUp = email => ({
	type: "SIGNUP_EMAIL_EXISTS",
	payload: { email, alreadySignedUp: true }
});

const initializeSession = payload => ({
	type: "INIT_SESSION",
	payload
});

export const completeOnboarding = () => ({ type: "ONBOARDING_COMPLETE" });
export const goToSignup = () => ({ type: "GO_TO_SIGNUP" });
export const goToLogin = () => ({ type: "GO_TO_LOGIN" });
export const goToConfirmation = attributes => ({ type: "GO_TO_CONFIRMATION", payload: attributes });

export const register = attributes => async (dispatch, getState, { http }) => {
	const { repoAttributes } = getState();

	const { payload } = await dispatch(fetchRepoInfo(repoAttributes));

	if (payload.usernamesInTeam.includes(attributes.username))
		return dispatch({ type: "SIGNUP-USERNAME_COLLISION" });

	return http
		.post("/no-auth/register", attributes)
		.then(async ({ user }) => {
			user = normalize(user);
			await dispatch(saveUser(user));
			dispatch({ type: "SIGNUP_SUCCESS", payload: { ...attributes, userId: user.id } });
		})
		.catch(error => {
			if (http.isApiRequestError(error)) {
				if (error.data.code === "RAPI-1004") dispatch(userAlreadySignedUp(attributes.email));
				if (error.data.code === "USRC-1009") dispatch(invalidBetaCode());
			}
			if (http.isApiUnreachableError(error)) dispatch(serverUnreachable());
		});
};

export const confirmEmail = attributes => (dispatch, getState, { http }) => {
	dispatch(requestStarted());
	return http
		.post("/no-auth/confirm", attributes)
		.then(async ({ accessToken, user, teams, repos, pubnubKey }) => {
			dispatch(requestFinished());
			user = normalize(user);

			const { context, repoAttributes } = getState();
			let teamIdForRepo = context.currentTeamId;
			if (!teamIdForRepo) {
				// fetch repo info again just in case a team has been created since CS was initialized
				const action = await dispatch(fetchRepoInfo(repoAttributes));
				if (action && action.payload) teamIdForRepo = action.payload.currentTeamId;
			}
			const userTeams = normalize(teams);
			const userRepos = normalize(repos);

			const teamIdsForUser = user.teamIds || userTeams.map(team => team.id);

			// TODO: handle db error - maybe continue updating the view?
			await saveUser(user);
			await dispatch(saveTeams(userTeams));
			await dispatch(saveRepos(userRepos));
			const sessionId = UUID();
			await dispatch(
				initializeSession({
					userId: user.id,
					accessToken,
					sessionId,
					pubnubSubscribeKey: pubnubKey
				})
			);

			if (!teamIdForRepo && userTeams.length === 0)
				dispatch({ type: "NEW_USER_CONFIRMED_IN_NEW_REPO" });
			else if (!teamIdForRepo && userTeams.length > 0) {
				await dispatch(fetchTeamMembers(teamIdsForUser));
				dispatch({ type: "EXISTING_USER_CONFIRMED_IN_NEW_REPO" });
			} else if (teamIdsForUser.includes(teamIdForRepo)) {
				await dispatch(fetchTeamMembers(teamIdsForUser));
				dispatch(fetchStreams());
				dispatch({ type: "EXISTING_USER_CONFIRMED" });
			} else await dispatch(joinTeam("EXISTING_USER_CONFIRMED"));
			dispatch({ type: "USER_CONFIRMED" });
		})
		.catch(error => {
			dispatch(requestFinished());
			if (http.isApiRequestError(error)) {
				const { data } = error;
				if (data.code === "USRC-1002") dispatch({ type: "INVALID_CONFIRMATION_CODE" });
				if (data.code === "USRC-1003") dispatch({ type: "EXPIRED_CONFIRMATION_CODE" });
				if (data.code === "USRC-1004") dispatch(goToSignup());
				if (data.code === "USRC-1006")
					dispatch({
						type: "USER_ALREADY_CONFIRMED",
						payload: { alreadyConfirmed: true, email: attributes.email }
					});
				if (data.code === "REPO-1000") dispatch(noAccess());
			} else if (http.isApiUnreachableError(error)) dispatch(serverUnreachable());
			else logError("Encountered an unexpected error while confirming email address", error);
		});
};

export const sendNewCode = attributes => (dispatch, getState, { http }) => {
	return http.post("/no-auth/register", attributes).catch(error => {
		if (http.isApiRequestError(error) && error.data.code === "RAPI-1004") return true;
		if (http.isApiUnreachableError(error)) dispatch(serverUnreachable());
	});
};

export const createTeam = name => (dispatch, getState, { http }) => {
	const { session, repoAttributes } = getState();
	const params = {
		url: repoAttributes.url,
		firstCommitHash: repoAttributes.firstCommitHash,
		team: { name }
	};
	dispatch(requestStarted());
	return http
		.post("/repos", params, session.accessToken)
		.then(async data => {
			dispatch(requestFinished());
			const team = normalize(data.team);
			const repo = normalize(data.repo);

			await dispatch(saveRepo(repo));
			await dispatch(saveTeam(team));

			dispatch(setCurrentTeam(team.id));
			dispatch(setCurrentRepo(repo.id));

			dispatch({ type: "TEAM_CREATED", payload: { teamId: team.id } });
		})
		.catch(error => {
			dispatch(requestFinished());
			if (http.isApiRequestError(error)) {
				if (error.data.code === "RAPI-1005") dispatch({ type: "CREATE_TEAM-INVALID_REPO_URL" });
			} else if (http.isApiUnreachableError(error)) dispatch(serverUnreachable());
			else logError("Encountered an unexpected error while creating team", error);
		});
};

export const addRepoForTeam = teamId => (dispatch, getState, { http }) => {
	const { repoAttributes, session, teams } = getState();
	const params = { ...repoAttributes, teamId };
	dispatch(requestStarted());
	http
		.post("/repos", params, session.accessToken)
		.then(async data => {
			const repo = normalize(data.repo);
			dispatch(requestFinished());
			await dispatch(saveRepo(repo));
			dispatch(setCurrentRepo(repo.id));
			dispatch(setCurrentTeam(teamId));
			dispatch({ type: "REPO_ADDED_FOR_TEAM", payload: teams[teamId].name });
		})
		.catch(error => {
			dispatch(requestFinished());
			if (http.isApiRequestError(error)) {
				if (error.data.code === "RAPI-1003") dispatch(teamNotFound());
				if (error.data.code === "RAPI-1011") dispatch(noPermission());
			} else if (http.isApiUnreachableError(error)) {
				dispatch(serverUnreachable());
			}
		});
};

export const teamNotFound = () => ({ type: "TEAM_NOT_FOUND" });
export const noPermission = () => ({ type: "INVALID_PERMISSION_FOR_TEAM" });

export const addMembers = people => (dispatch, getState, { http }) => {
	const { repoAttributes, currentTeamId, session } = getState();
	const params = { ...repoAttributes, teamId: currentTeamId, users: people };
	return http
		.post("/repos", params, session.accessToken)
		.then(({ users }) => {
			dispatch(saveUsers(normalize(users)));
			dispatch(completeOnboarding());
		})
		.catch(error => {
			if (http.isApiRequestError(error)) {
				if (error.data.code === "RAPI-1003") dispatch(teamNotFound());
				if (error.data.code === "RAPI-1011") dispatch(noPermission());
			} else if (http.isApiUnreachableError(error)) {
				dispatch(serverUnreachable());
			}
		});
};

export const authenticate = params => (dispatch, getState, { http }) => {
	dispatch(requestStarted());
	return http
		.put("/no-auth/login", params)
		.then(async ({ accessToken, user, teams, repos, pubnubKey }) => {
			dispatch(requestFinished());
			user = normalize(user);

			if (!user.isRegistered)
				return dispatch(
					goToConfirmation({
						userId: user.id,
						username: user.username,
						email: user.email,
						password: params.password,
						firstName: user.firstName || "",
						lastName: user.lastName || ""
					})
				);

			const userTeams = normalize(teams);
			repos = normalize(repos);
			await dispatch(saveUser(user));
			await dispatch(saveTeams(userTeams));
			await dispatch(saveRepos(repos));

			const { context, repoAttributes } = getState();

			const teamIdsForUser = user.teamIds || userTeams.map(team => team.id);

			const sessionId = UUID();
			dispatch(
				initializeSession({
					accessToken,
					userId: user.id,
					sessionId,
					pubnubSubscribeKey: pubnubKey
				})
			);

			let teamIdForRepo = context.currentTeamId;
			if (!teamIdForRepo) {
				// fetch repo info again just in case a team has been created since CS was initialized
				const action = await dispatch(fetchRepoInfo(repoAttributes));
				if (action && action.payload) teamIdForRepo = action.payload.currentTeamId;
			}

			if (!teamIdForRepo && userTeams.length === 0)
				dispatch({ type: "NEW_USER_LOGGED_INTO_NEW_REPO" });
			else if (!teamIdForRepo && userTeams.length > 0) {
				await dispatch(fetchTeamMembers(teamIdsForUser));
				dispatch({ type: "EXISTING_USER_LOGGED_INTO_NEW_REPO" });
			} else if (teamIdsForUser.includes(teamIdForRepo)) {
				await dispatch(fetchTeamMembers(teamIdsForUser));
				dispatch(fetchLatestForCurrentStream());
				dispatch(loggedIn());
			} else await dispatch(joinTeam(loggedIn().type));
		})
		.catch(error => {
			dispatch(requestFinished());
			if (http.isApiRequestError(error)) {
				if (error.data.code === "USRC-1000") dispatch(serverUnreachable());
				if (error.data.code === "USRC-1001") dispatch(invalidCredentials());
				if (error.data.code === "RAPI-1003") dispatch(invalidCredentials());
				if (error.data.code === "REPO-1000") dispatch(noAccess());
				if (error.data.code === "RAPI-1005") dispatch(noAccess()); // TODO: How to handle url invalid here? Just bailing and saying no access for url invalid
			} else if (http.isApiUnreachableError(error)) dispatch(serverUnreachable());
			else logError("Encountered unexpected error while authenticating", error);
		});
};

export const joinTeam = nextAction => (dispatch, getState, { http }) => {
	return dispatch(_joinTeam())
		.then(() => {
			dispatch({ type: nextAction });
			dispatch(fetchStreams());
		})
		.catch(error => {
			if (http.isApiRequestError(error)) {
				if (error.data.code === "TEAM-1000")
					dispatch(usernameCollision(error.data.info, nextAction));
			}
		});
};

export const changeUsername = username => (dispatch, getState, { http }) => {
	return http
		.put("/users/me", { username }, getState().session.accessToken)
		.then(data => dispatch(saveUser(normalize(data.user))));
};
