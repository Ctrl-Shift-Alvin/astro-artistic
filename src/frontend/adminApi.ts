import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import clsx from 'clsx';
import {
	disableUnloadConfirmation,
	goto
} from './windowTools';
import { Dialog } from '@/components/components/DialogProvider';
import {
	Monolog, MonologProvider
} from '@/components/components/MonologProvider';
import {
	ZAuthPostApiRequest,
	ZProtectedGetApiResponse,
	ZProtectedPostApiRequestMap,
	ZProtectedPostApiResponseMap,
	type TBuild,
	type TContactFormEntry,
	type TError,
	type TEventEntry,
	type TNewEventEntry,
	type TBlogMarkdownInstance
} from '@/components/types';
import {
	lsGetAuthTokenExpiry,
	lsSetAuthTokenExpiry
} from '@/frontend/localStorage';

export const getPrevUrlQuery = () => {

	return `?prevUrl=${encodeURIComponent(location.pathname + location.search)}`;

};
export const gotoPrevOrHome = () => {

	const prevUrl = new URLSearchParams(location.search).get('prevUrl');
	goto(prevUrl ?? '/admin/home/');

};

// #region Auth API

let currentTimeout: NodeJS.Timeout;
export const checkLogin = (): boolean => {

	const tokenExpiry = lsGetAuthTokenExpiry();
	return tokenExpiry
		? Date.now() - tokenExpiry <= 0
		: false;

};

export const login = async(password: string): Promise<boolean> => {

	const authRequestBody = ZAuthPostApiRequest.parse({ password });
	const authResponse = await fetch(
		'/api/auth/',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(authRequestBody),
			credentials: 'include'
		}
	);

	if (!authResponse.ok) {

		Monolog.show({
			text: `Error: Could not authenticate (${authResponse.status})!`,
			durationMs: 2000
		});
		return false;

	}

	const testResponse = await fetch(
		'/api/protected/',
		{
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include'
		}
	);

	const {
		success: testResponseSuccess,
		data: testResponseData
	} = await ZProtectedGetApiResponse.safeParseAsync(await testResponse.json());

	if (!testResponseSuccess || 'error' in testResponseData) {

		Monolog.show({
			text: 'Error: Incorrect password!',
			durationMs: 2000
		});
		return false;

	} else {

		void Monolog
			.showAsync({
				text: 'Success: Logged in!',
				durationMs: 1500
			})
			.then(() => {

				gotoPrevOrHome();

			});
		lsSetAuthTokenExpiry(testResponseData.expiry);
		setLogoutTimeout();
		return true;

	}

};

export const logout = async(timeout: boolean = false) => {

	const response = await fetch(
		'/api/auth/',
		{
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include'
		}
	);

	lsSetAuthTokenExpiry(null);
	clearTimeout(currentTimeout);

	const contentDiv = document.getElementById('content-div');

	// Aggressively delete document immediately
	if (contentDiv) {

		contentDiv.childNodes.forEach((n) => {

			n.remove();

		});

		const h1 = document.createElement('h1');
		h1.textContent = 'Logged out!';
		h1.classList.add(
			'absolute',
			'top-20',
			'left-0',
			'right-0',
			'text-4xl',
			'text-center'
		);
		contentDiv.appendChild(h1);

		// Readd MonologManager
		const newMonologContainer = document.createElement('div');
		contentDiv.appendChild(newMonologContainer);

		let calledBack = false;
		const callback = () => {

			calledBack = true;
			disableUnloadConfirmation();

			if (response.ok) {

				void Monolog
					.showAsync({
						text: clsx(
							timeout && 'Token timeout: ',
							'Successfully logged out!'
						),
						durationMs: 2000,
						fadeDurationMs: 500
					})
					.then(() => {

						goto(`/admin/login/${
							timeout
								? getPrevUrlQuery()
								: ''
						}`);

					});

			} else {

				void Monolog
					.showAsync({
						text: clsx(
							timeout && 'Token timeout: ',
							'Partially successfully logged out! (Auth API Endpoint error)'
						),
						durationMs: 2000,
						fadeDurationMs: 500
					})
					.then(() => {

						goto('/admin/login/');

					});

			}

		};

		const MonologProviderWrapper = ({ onReady }: { onReady: ()=> void }) => {

			useEffect(
				() => {

					onReady();

				},
				[ onReady ]
			);

			return React.createElement(MonologProvider);

		};
		createRoot(newMonologContainer).render(React.createElement(
			MonologProviderWrapper,
			{ onReady: callback }
		));

		setTimeout(
			() => {

				if (calledBack)
					return;

				console.error('Failed to redirect using Monolog.showAsync! Falling back.');

				if (response.ok) {

					goto(`/admin/login/${
						timeout
							? getPrevUrlQuery()
							: ''
					}`);

				} else {

					goto('/admin/login/');

				}

			},
			3000
		);

	}

};

export const setLogoutTimeout = (callback?: ()=> void) => {

	const tokenExpiry = lsGetAuthTokenExpiry();
	if (tokenExpiry) {

		const timeDifference = tokenExpiry - Date.now();

		if (timeDifference >= 0) {

			currentTimeout = setTimeout(
				() => {

					void logout(true).then(callback);

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

			void logout(true).then(callback);

		}

	}

};

// #endregion

// #region Blog

export const fetchBlogIndex = async(
	count: number | string,
	offset?: number | string
): Promise<TBlogMarkdownInstance[] | null> => {

	const requestBody = ZProtectedPostApiRequestMap['blog/index'].safeParse({
		count,
		offset
	});

	if (!requestBody.success)
		return null;

	const response = await fetch(
		'/api/protected/?type=blog/index',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody.data),
			credentials: 'include'
		}
	);

	const parsedResponse = await ZProtectedPostApiResponseMap['blog/index'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data) {

		Monolog.show({
			text: `Failed to fetch blog index with count '${count}'${
				offset
					? ` and offset '${offset}'`
					: ''
			}!`,
			durationMs: 3000
		});
		return null;

	}

	return parsedResponse.data.data;

};
export const fetchBlogCount = async(): Promise<number | null> => {

	const response = await fetch(
		'/api/protected/?type=blog/count',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include'
		}
	);

	const parsedResponse = await ZProtectedPostApiResponseMap['blog/count'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data) {

		Monolog.show({
			text: 'Failed to fetch blog count!',
			durationMs: 3000
		});
		return null;

	}
	return parsedResponse.data.count;

};
export const fetchBlogFile = async(
	fileName: string,
	gotoPrevUrl: boolean = false
): Promise<string | null> => {

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

	const parsedResponse = await ZProtectedPostApiResponseMap['blog/get'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data) {

		void Monolog
			.showAsync({
				text: `Failed to fetch a blog file named '${fileName}'!`,
				durationMs: 3000
			})
			.then(() => {

				if (gotoPrevUrl)
					gotoPrevOrHome();

			});
		return null;

	}

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

	const parsedResponse = await ZProtectedPostApiResponseMap['blog/save'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data) {

		Monolog.show({
			text: `Failed to save a blog file named '${fileName}'!`,
			durationMs: 3000
		});
		return false;

	}
	Monolog.show({
		text: `Successfully saved the blog file named '${fileName}'!`,
		durationMs: 3000
	});
	return true;

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

	const parsedResponse = await ZProtectedPostApiResponseMap['blog/new'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data) {

		if (response.status == 409) {

			Monolog.show({
				text: `Failed to create a new blog file named '${fileName}' because the file already exists!`,
				durationMs: 3000
			});

		} else {

			Monolog.show({
				text: `Failed to create a new blog file named '${fileName}'!`,
				durationMs: 3000
			});

		}

		return false;

	}
	Monolog.show({
		text: `Successfully created a blog file named '${fileName}'!`,
		durationMs: 3000
	});
	return true;

};
export const removeBlogFile = async(
	fileName: string,
	gotoPrevUrl: boolean = false
): Promise<boolean> => {

	if (
		!await Dialog.yesNo(
			'Remove Blog Post File',
			`Removing the file '${fileName}' cannot be reverted. Are you sure you want to continue?`
		)
	)
		return false;

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

	const parsedResponse = await ZProtectedPostApiResponseMap['blog/remove'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data) {

		Monolog.show({
			text: `Failed to remove a blog file named '${fileName}'!`,
			durationMs: 3000
		});
		return false;

	}

	void Monolog
		.showAsync({ text: `Successfully removed the blog file named '${fileName}'!` })
		.then(() => {

			if (gotoPrevUrl)
				gotoPrevOrHome();

		});
	return true;

};

// #endregion

// #region Contact

export const fetchContactEntryIndex = async(
	count: number | string,
	offset?: number | string
): Promise<TContactFormEntry[] | null> => {

	const requestBody = ZProtectedPostApiRequestMap['contact/index'].safeParse({
		count,
		offset
	});
	if (!requestBody.success)
		return null;

	const response = await fetch(
		'/api/protected/?type=contact/index',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody.data),
			credentials: 'include'
		}
	);

	const parsedResponse = await ZProtectedPostApiResponseMap['contact/index'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data) {

		Monolog.show({
			text: `Failed to fetch contact submission index with count '${count}'${
				offset
					? ` and offset '${offset}'`
					: ''
			}!`,
			durationMs: 3000
		});
		return null;

	}

	return parsedResponse.data.data;

};
export const fetchContactEntryCount = async(): Promise<number | null> => {

	const response = await fetch(
		'/api/protected/?type=contact/count',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include'
		}
	);

	const parsedResponse = await ZProtectedPostApiResponseMap['contact/count'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data) {

		Monolog.show({
			text: 'Failed to fetch the contact form entry count!',
			durationMs: 3000
		});
		return null;

	}
	return parsedResponse.data.count;

};
export const fetchContactEntry = async(
	id: string | number,
	gotoPrevUrl: boolean = false
): Promise<TContactFormEntry | null> => {

	const requestBody = ZProtectedPostApiRequestMap['contact/get'].safeParse({ id });
	if (!requestBody.success)
		return null;

	const response = await fetch(
		'/api/protected/?type=contact/get',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody.data),
			credentials: 'include'
		}
	);

	const parsedResponse = await ZProtectedPostApiResponseMap['contact/get'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data) {

		void Monolog
			.showAsync({
				text: `Failed to get a contact form submission with the ID '${id}'!`,
				durationMs: 3000
			})
			.then(() => {

				if (gotoPrevUrl)
					gotoPrevOrHome();

			});
		return null;

	}

	return parsedResponse.data.data;

};
export const deleteContactEntry = async(
	id: string | number,
	gotoPrevUrl: boolean = false
): Promise<boolean> => {

	if (
		!await Dialog.yesNo(
			'Are you sure you want to delete this contact form submission?',
			`This will irreversibly remove the contact form submission with ID '${id}'.`
		)
	) {

		return false;

	}

	const requestBody = ZProtectedPostApiRequestMap['contact/delete'].safeParse({ id });
	if (!requestBody.success)
		return false;

	const response = await fetch(
		'/api/protected/?type=contact/delete',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody.data),
			credentials: 'include'
		}
	);

	const parsedResponse = await ZProtectedPostApiResponseMap['contact/delete'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data) {

		Monolog.show({
			text: `Failed to delete a contact form submission with the ID '${id}'!`,
			durationMs: 3000
		});
		return false;

	}

	void Monolog
		.showAsync({ text: `Successfully deleted the contact form submission with the ID '${id}'!` })
		.then(() => {

			if (gotoPrevUrl)
				gotoPrevOrHome();

		});
	return true;

};

// #endregion

// #region Events

export const fetchEventIndex = async(): Promise<TEventEntry[] | null> => {

	const response = await fetch(
		'/api/protected/?type=events/index',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include'
		}
	);

	const parsedResponse = await ZProtectedPostApiResponseMap['events/index'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data) {

		Monolog.show({
			text: 'Failed to fetch event entry index!',
			durationMs: 3000
		});
		return null;

	}

	return parsedResponse.data.data;

};
export const fetchEvent = async(
	id: string | number,
	gotoPrevUrl: boolean = false
): Promise<{
	data: TEventEntry;
	file: string | undefined;
} | null> => {

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

	const parsedResponse = await ZProtectedPostApiResponseMap['events/get'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data) {

		void Monolog
			.showAsync({
				text: `Failed to fetch an event entry with the ID '${id}'!`,
				durationMs: 3000
			})
			.then(() => {

				if (gotoPrevUrl)
					gotoPrevOrHome();

			});
		return null;

	}
	return {
		data: parsedResponse.data.data,
		file: parsedResponse.data.file
	};

};
export const addEvent = async(newEntry: TNewEventEntry): Promise<boolean> => {

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

	const parsedResponse = await ZProtectedPostApiResponseMap['events/add'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data) {

		Monolog.show({
			text: `Failed to add new event entry titled '${
				newEntry.title.length > 10
					? newEntry.title.slice(
						0,
						10
					) + '...'
					: newEntry.title
			}'!`,
			durationMs: 3000
		});
		return false;

	}
	return true;

};
export const deleteEvent = async(
	id: string | number,
	gotoPrevUrl: boolean = false
): Promise<boolean> => {

	if (
		!await Dialog.yesNo(
			'Are you sure you want to delete this event entry?',
			`This will irreversibly remove the event entry with ID '${id}'.`
		)
	)
		return false;

	const requestBody = ZProtectedPostApiRequestMap['events/delete'].safeParse({ id });
	if (!requestBody.success)
		return false;

	const response = await fetch(
		'/api/protected/?type=events/delete',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody.data),
			credentials: 'include'
		}
	);

	const parsedResponse = await ZProtectedPostApiResponseMap['events/delete'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data) {

		Monolog.show({
			text: `Failed to delete an event entry with the ID '${id}'!`,
			durationMs: 3000
		});
		return false;

	}
	void Monolog
		.showAsync({ text: `Successfully deleted the event entry with the ID '${id}'!` })
		.then(() => {

			if (gotoPrevUrl)
				gotoPrevOrHome();

		});
	return true;

};
export const editEvent = async(
	id: string | number,
	newEntry: TNewEventEntry
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

	const parsedResponse = await ZProtectedPostApiResponseMap['events/edit'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data) {

		Monolog.show({
			text: `Failed to edit an event entry with the ID '${id}'!`,
			durationMs: 3000
		});
		return false;

	}
	Monolog.show({
		text: `Successfully edited the event entry with the ID '${id}'!`,
		durationMs: 3000
	});
	return true;

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

	const parsedResponse = await ZProtectedPostApiResponseMap['events/save'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data) {

		Monolog.show({
			text: `Failed to save an event entry with the ID '${id}'!`,
			durationMs: 3000
		});
		return false;

	}
	Monolog.show({
		text: `Successfully saved the event entry contents with the ID '${id}'!`,
		durationMs: 3000
	});
	return true;

};

// #endregion

// #region Errors & Builds

export const fetchBuildIndex = async(
	count: number | string,
	offset?: number | string
): Promise<TBuild[] | null> => {

	const requestBody = ZProtectedPostApiRequestMap['builds/index'].safeParse({
		count,
		offset
	});
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

	const parsedResponse = await ZProtectedPostApiResponseMap['builds/index'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data) {

		Monolog.show({
			text: `Failed to fetch build index with count '${count}'${
				offset
					? ` and offset '${offset}'`
					: ''
			}!`,
			durationMs: 3000
		});
		return null;

	}
	return parsedResponse.data.data;

};
export const fetchBuild = async(
	buildNumber: number | string,
	gotoPrevUrl: boolean = false
): Promise<TBuild | null> => {

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

	const parsedResponse = await ZProtectedPostApiResponseMap['builds/get'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data) {

		void Monolog
			.showAsync({
				text: `Failed to fetch a build with the build number '${buildNumber}'!`,
				durationMs: 3000
			})
			.then(() => {

				if (gotoPrevUrl)
					gotoPrevOrHome();

			});
		return null;

	}
	return parsedResponse.data.data;

};
export const fetchBuildCount = async(): Promise<number | null> => {

	const response = await fetch(
		'/api/protected/?type=builds/count',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include'
		}
	);

	const parsedResponse = await ZProtectedPostApiResponseMap['builds/count'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data) {

		Monolog.show({
			text: 'Failed to fetch the build count!',
			durationMs: 3000
		});
		return null;

	}
	return parsedResponse.data.count;

};
export const deleteBuild = async(
	buildNumber: number | string,
	gotoPrevUrl: boolean = false
): Promise<boolean> => {

	if (
		!await Dialog.yesNo(
			'Are you sure you want to delete this build?',
			`This will irreversibly remove the build with the build number '${buildNumber}', AND its corresponding errors.`
		)
	)
		return false;

	const requestBody = ZProtectedPostApiRequestMap['builds/delete'].safeParse({ buildNumber });
	if (!requestBody.success)
		return false;

	const response = await fetch(
		'/api/protected/?type=builds/delete',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody.data),
			credentials: 'include'
		}
	);

	const parsedResponse = await ZProtectedPostApiResponseMap['builds/delete'].safeParseAsync(await response.json());
	if (!parsedResponse.success) {

		Monolog.show({
			text: `Failed to delete a build with the build number '${buildNumber}'!`,
			durationMs: 3000
		});
		return false;

	}
	void Monolog
		.showAsync({ text: `Successfully deleted the build with the build number '${buildNumber}' and its errors!` })
		.then(() => {

			if (gotoPrevUrl)
				gotoPrevOrHome();

		});
	return true;

};

export const fetchErrorIndex = async(
	count: number | string,
	offset?: number | string
): Promise<TError[] | null> => {

	const requestBody = ZProtectedPostApiRequestMap['errors/index'].safeParse({
		count,
		offset
	});
	if (!requestBody.success)
		return null;

	const response = await fetch(
		'/api/protected/?type=errors/index',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody.data),
			credentials: 'include'
		}
	);

	const parsedResponse = await ZProtectedPostApiResponseMap['errors/index'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data) {

		Monolog.show({
			text: `Failed to fetch the error index with count '${count}'${
				offset
					? ` and offset '${offset}'`
					: ''
			}!`,
			durationMs: 3000
		});
		return null;

	}
	return parsedResponse.data.data;

};
export const fetchErrorCount = async(): Promise<number | null> => {

	const response = await fetch(
		'/api/protected/?type=errors/count',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include'
		}
	);

	const parsedResponse = await ZProtectedPostApiResponseMap['errors/count'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data) {

		Monolog.show({
			text: 'Failed to fetch the error count!',
			durationMs: 3000
		});
		return null;

	}
	return parsedResponse.data.count;

};
export const fetchErrorIndexByBuild = async(
	buildNumber: number | string,
	count: number | string,
	offset?: number | string
): Promise<TError[] | null> => {

	const requestBody = ZProtectedPostApiRequestMap['errors/indexBuild'].safeParse({
		buildNumber,
		count,
		offset
	});
	if (!requestBody.success)
		return null;

	const response = await fetch(
		'/api/protected/?type=errors/indexBuild',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody.data),
			credentials: 'include'
		}
	);

	const parsedResponse = await ZProtectedPostApiResponseMap['errors/indexBuild'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data) {

		Monolog.show({
			text: `Failed to fetch the build index for the build number '${buildNumber}', with count '${count}'${
				offset
					? ` and offset '${offset}'`
					: ''
			}!`,
			durationMs: 3000
		});
		return null;

	}
	return parsedResponse.data.data;

};
export const fetchErrorCountByBuild = async(buildNumber: number | string): Promise<number | null> => {

	const requestBody = ZProtectedPostApiRequestMap['errors/countBuild'].safeParse({ buildNumber });
	if (!requestBody.success)
		return null;

	const response = await fetch(
		'/api/protected/?type=errors/countBuild',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody.data),
			credentials: 'include'
		}
	);

	const parsedResponse = await ZProtectedPostApiResponseMap['errors/countBuild'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data) {

		Monolog.show({
			text: `Failed to fetch the errors for the build number '${buildNumber}'!`,
			durationMs: 3000
		});
		return null;

	}
	return parsedResponse.data.count;

};
export const fetchError = async(
	id: number | string,
	gotoPrevUrl: boolean = false
): Promise<TError | null> => {

	const requestBody = ZProtectedPostApiRequestMap['errors/get'].safeParse({ id });
	if (!requestBody.success)
		return null;

	const response = await fetch(
		'/api/protected/?type=errors/get',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody.data),
			credentials: 'include'
		}
	);

	const parsedResponse = await ZProtectedPostApiResponseMap['errors/get'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data) {

		void Monolog
			.showAsync({
				text: `Failed to fetch an error with ID '${id}'!`,
				durationMs: 3000
			})
			.then(() => {

				if (gotoPrevUrl)
					gotoPrevOrHome();

			});
		return null;

	}
	return parsedResponse.data.data;

};
export const deleteError = async(
	id: number | string,
	gotoPrevUrl: boolean = false
): Promise<boolean> => {

	if (
		!await Dialog.yesNo(
			'Are you sure you want to delete this error?',
			`This will irreversibly remove the error with the ID '${id}'.`
		)
	)
		return false;

	const requestBody = ZProtectedPostApiRequestMap['errors/delete'].safeParse({ id });
	if (!requestBody.success)
		return false;

	const response = await fetch(
		'/api/protected/?type=errors/delete',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody.data),
			credentials: 'include'
		}
	);

	const parsedResponse = await ZProtectedPostApiResponseMap['errors/delete'].safeParseAsync(await response.json());
	if (!parsedResponse.success || 'error' in parsedResponse.data) {

		Monolog.show({
			text: `Failed to delete an error with ID '${id}'!`,
			durationMs: 3000
		});
		return false;

	}
	void Monolog
		.showAsync({ text: `Successfully deleted the error with ID '${id}'!` })
		.then(() => {

			if (gotoPrevUrl)
				gotoPrevOrHome();

		});
	return true;

};

// #endregion
