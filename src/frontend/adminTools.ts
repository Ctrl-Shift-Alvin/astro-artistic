import { Monolog } from '@/components/components/MonologProvider';
import {
	ZAuthPostApiRequest,
	type TContactFormEntry,
	type TEventsEntry,
	type TNewEventsEntry,
	ZProtectedGetApiResponse,
	ZProtectedPostApiRequestMap,
	TProtectedPostApiResponseMap,
	TBuild
} from '@/components/types';
import {
	lsGetAuthTokenExpiry,
	lsSetAuthTokenExpiry
} from '@/frontend/localStorage';

// #region Auth API

let currentTimeout: NodeJS.Timeout;
let logoutCallback: ()=> void;
export const setLogoutCallback = (callback: ()=> void) => {

	logoutCallback = callback;

};
export const checkLogin = (): boolean => {

	const tokenExpiry = lsGetAuthTokenExpiry();
	return tokenExpiry
		? Date.now() - tokenExpiry <= 0
		: false;

};

export const login = async(password: string): Promise<boolean> => {

	const responseBody = ZAuthPostApiRequest.parse({ password });
	const response = await fetch(
		'/api/auth/',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(responseBody),
			credentials: 'include'
		}
	);

	if (!response.ok)
		return false;

	const response1 = await fetch(
		'/api/protected/',
		{
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include'
		}
	);

	const {
		success: success1, data: data1
	} = await ZProtectedGetApiResponse.safeParseAsync(await response1.json());

	if (!success1 || 'error' in data1)
		return false;

	lsSetAuthTokenExpiry(data1.expiry);
	return true;

};
export const logout = async() => {

	const response = await fetch(
		'/api/auth/',
		{
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include'
		}
	);

	if (response.ok) {

		lsSetAuthTokenExpiry(null);
		clearTimeout(currentTimeout);
		logoutCallback();
		logoutCallback = () => {};

	}

};

export const setLogoutTimeout = () => {

	const tokenExpiry = lsGetAuthTokenExpiry();
	if (tokenExpiry) {

		const timeDifference = tokenExpiry - Date.now();

		if (timeDifference >= 0) {

			currentTimeout = setTimeout(
				() => {

					void logout().then(logoutCallback);

				},
				timeDifference
			);

			window.addEventListener(
				'beforeunload',
				() => {

					clearTimeout(currentTimeout);

				}
			);

		} else {

			void logout();

		}

	}

};
export const handleAuthSubmit = async(event?: Event) => {

	event?.preventDefault();

	const passwordField = document.getElementById('password') as HTMLInputElement | null;
	if (passwordField === null) {

		console.error('Failed to get password from the password field!');
		return;

	}

	const loginResult = await login(passwordField.value);
	if (loginResult) {

		Monolog.show({
			text: 'Success: Logged in!',
			durationMs: 1500
		});
		setLogoutTimeout();

	} else {

		Monolog.show({
			text: 'Error: Incorrect password!',
			durationMs: 2000
		});

	}

};

// #endregion

// #region Blog

export const fetchBlogIndex = async(): Promise<string[] | null> => {

	const response = await fetch(
		'/api/protected/?type=blog/index',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include'
		}
	);

	const parsedResponse = await TProtectedPostApiResponseMap['blog/index'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data)
		return null;

	return parsedResponse.data.data;

};
export const fetchBlogFile = async(fileName: string): Promise<string | null> => {

	const requestBody = ZProtectedPostApiRequestMap['blog/get'].safeParse({ fileName });
	if (!requestBody.success)
		return null;

	const response = await fetch(
		'/api/protected/?type=blog/get',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody.data),
			credentials: 'include'
		}
	);

	const parsedResponse = await TProtectedPostApiResponseMap['blog/get'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data)
		return null;

	return parsedResponse.data.data;

};
export const saveBlogFile = async(
	fileName: string,
	fileContent: string
): Promise<boolean> => {

	const requestBody = ZProtectedPostApiRequestMap['blog/save'].safeParse({
		fileName,
		data: fileContent
	});
	if (!requestBody.success)
		return false;

	const response = await fetch(
		'/api/protected/?type=blog/save',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody.data),
			credentials: 'include'
		}
	);

	const parsedResponse = await TProtectedPostApiResponseMap['blog/save'].safeParseAsync(await response.json());
	return parsedResponse.success && !('error' in parsedResponse.data);

};
export const newBlogFile = async(fileName: string): Promise<boolean> => {

	const requestBody = ZProtectedPostApiRequestMap['blog/new'].safeParse({ fileName });
	if (!requestBody.success)
		return false;

	const response = await fetch(
		'/api/protected/?type=blog/new',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody.data),
			credentials: 'include'
		}
	);

	const parsedResponse = await TProtectedPostApiResponseMap['blog/new'].safeParseAsync(await response.json());
	return parsedResponse.success && !('error' in parsedResponse.data);

};
export const removeBlogFile = async(fileName: string): Promise<boolean> => {

	const requestBody = ZProtectedPostApiRequestMap['blog/remove'].safeParse({ fileName });
	if (!requestBody.success)
		return false;

	const response = await fetch(
		'/api/protected/?type=blog/remove',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody.data),
			credentials: 'include'
		}
	);

	const parsedResponse = await TProtectedPostApiResponseMap['blog/remove'].safeParseAsync(await response.json());
	return parsedResponse.success && !('error' in parsedResponse.data);

};

// #endregion

// #region Contact

export const getContactForms = async(): Promise<TContactFormEntry[] | null> => {

	const response = await fetch(
		'/api/protected/?type=forms/index',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include'
		}
	);

	const parsedResponse = await TProtectedPostApiResponseMap['forms/index'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data)
		return null;

	return parsedResponse.data.data;

};
export const getContactForm = async(id: string | number): Promise<TContactFormEntry | null> => {

	const requestBody = ZProtectedPostApiRequestMap['forms/get'].safeParse({ id });
	if (!requestBody.success)
		return null;

	const response = await fetch(
		'/api/protected/?type=forms/get',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody.data),
			credentials: 'include'
		}
	);

	const parsedResponse = await TProtectedPostApiResponseMap['forms/get'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data)
		return null;

	return parsedResponse.data.data;

};
export const removeContactForm = async(id: string | number): Promise<boolean> => {

	const requestBody = ZProtectedPostApiRequestMap['forms/remove'].safeParse({ id });
	if (!requestBody.success)
		return false;

	const response = await fetch(
		'/api/protected/?type=forms/remove',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody.data),
			credentials: 'include'
		}
	);

	const parsedResponse = await TProtectedPostApiResponseMap['forms/remove'].safeParseAsync(await response.json());
	return parsedResponse.success;

};

// #endregion

// #region Events

export const getEventsIndex = async(): Promise<TEventsEntry[] | null> => {

	const response = await fetch(
		'/api/protected/?type=events/index',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include'
		}
	);

	const parsedResponse = await TProtectedPostApiResponseMap['events/index'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data)
		return null;

	return parsedResponse.data.data;

};
export const addEventsEntry = async(newEntry: TNewEventsEntry): Promise<boolean> => {

	const requestBody = ZProtectedPostApiRequestMap['events/add'].safeParse({ data: newEntry });
	if (!requestBody.success)
		return false;

	const response = await fetch(
		'/api/protected/?type=events/add',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody.data),
			credentials: 'include'
		}
	);

	const parsedResponse = await TProtectedPostApiResponseMap['events/add'].safeParseAsync(await response.json());
	return parsedResponse.success && !('error' in parsedResponse.data);

};
export const removeEventsEntry = async(id: string | number): Promise<boolean> => {

	const requestBody = ZProtectedPostApiRequestMap['events/remove'].safeParse({ id });
	if (!requestBody.success)
		return false;

	const response = await fetch(
		'/api/protected/?type=events/remove',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody.data),
			credentials: 'include'
		}
	);

	const parsedResponse = await TProtectedPostApiResponseMap['events/remove'].safeParseAsync(await response.json());
	return parsedResponse.success && !('error' in parsedResponse.data);

};
export const editEventsEntry = async(
	id: string | number,
	newEntry: TNewEventsEntry
): Promise<boolean> => {

	const requestBody = ZProtectedPostApiRequestMap['events/edit'].safeParse({
		id,
		data: newEntry
	});
	if (!requestBody.success)
		return false;

	const response = await fetch(
		'/api/protected/?type=events/edit',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody.data),
			credentials: 'include'
		}
	);

	const parsedResponse = await TProtectedPostApiResponseMap['events/edit'].safeParseAsync(await response.json());
	return parsedResponse.success && !('error' in parsedResponse.data);

};

export const getEvent = async(id: string | number): Promise<string | null> => {

	const requestBody = ZProtectedPostApiRequestMap['events/get'].safeParse({ id });
	if (!requestBody.success)
		return null;

	const response = await fetch(
		'/api/protected/?type=events/get',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody.data),
			credentials: 'include'
		}
	);

	const parsedResponse = await TProtectedPostApiResponseMap['events/get'].safeParseAsync(await response.json());
	return parsedResponse.success && !('error' in parsedResponse.data)
		? parsedResponse.data.data
		: null;

};
export const saveEvent = async(
	id: string | number,
	content: string
): Promise<boolean> => {

	const requestBody = ZProtectedPostApiRequestMap['events/save'].safeParse({
		id,
		data: content
	});
	if (!requestBody.success)
		return false;

	const response = await fetch(
		'/api/protected/?type=events/save',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody.data),
			credentials: 'include'
		}
	);

	const parsedResponse = await TProtectedPostApiResponseMap['events/save'].safeParseAsync(await response.json());
	return parsedResponse.success && !('error' in parsedResponse.data);

};

// #endregion

// #region Errors & Builds

export const getBuildsIndex = async(count: number | string): Promise<{
	data: TBuild[];
	count: number;
} | null> => {

	const requestBody = ZProtectedPostApiRequestMap['builds/index'].safeParse({ count });
	if (!requestBody.success)
		return null;

	const response = await fetch(
		'/api/protected/?type=builds/index',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody.data),
			credentials: 'include'
		}
	);

	const parsedResponse = await TProtectedPostApiResponseMap['builds/index'].safeParseAsync(await response.json());
	return parsedResponse.success && !('error' in parsedResponse.data)
		? parsedResponse.data
		: null;

};
export const getBuild = async(buildNumber: number | string): Promise<TBuild | null> => {

	const requestBody = ZProtectedPostApiRequestMap['builds/get'].safeParse({ buildNumber });
	if (!requestBody.success)
		return null;

	const response = await fetch(
		'/api/protected/?type=builds/get',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody.data),
			credentials: 'include'
		}
	);

	const parsedResponse = await TProtectedPostApiResponseMap['builds/get'].safeParseAsync(await response.json());
	return parsedResponse.success && !('error' in parsedResponse.data)
		? parsedResponse.data.data
		: null;

};
export const removeBuild = async(buildNumber: number | string): Promise<boolean> => {

	const requestBody = ZProtectedPostApiRequestMap['builds/remove'].safeParse({ buildNumber });
	if (!requestBody.success)
		return false;

	const response = await fetch(
		'/api/protected/?type=builds/remove',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody.data),
			credentials: 'include'
		}
	);

	const parsedResponse = await TProtectedPostApiResponseMap['builds/remove'].safeParseAsync(await response.json());
	return parsedResponse.success && !('error' in parsedResponse.data);

};

// #endregion
