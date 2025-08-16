# Astro Artistic

This website (template) is a design meant for portfolios used in an _artistic_ setting, based on [astro-boilerplate](https://github.com/ixartz/Astro-boilerplate) (though it's been changed so much, that it's basically a completely different page now). It features a simple and clean look, with smooth animations for a fluid navigation feeling. It also supports _i18n_, where the strings are saved in ts files.

The goal of this template is to provide a functional, but expandable function that anyone with a bit of experience can use to customize to their heart's content. It provides a strong base, but makes any large modifications easy, and smaller ones even easier.

## Tailwind CSS

The large majority of styling is done with [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss), with very little exceptions. It takes very little getting used to, removes the need for time-consuming (and annoying) style classes, and is simply practical. _If you don't like it: You're on your own, regarding styles._

## ESLint, Prettier, Husky and commitlint

This project is also setup with [ESLint](https://github.com/eslint/eslint) for code delinting of Astro, React, Typescript, JSON, JSONc and JSON5 files. [Prettier](https://github.com/prettier/prettier) is also installed on top, where the ESLint rules that might interfere with Prettier, are [disabled](https://github.com/prettier/eslint-config-prettier). Finally, [commitlint](https://github.com/conventional-changelog/commitlint) is used in combination with [Husky](https://github.com/typicode/husky) to validate commits before continuing.

## HTTPS Dev Server

Certificates are automatically generated using [vite-plugin-mkcert](https://github.com/liuweiGL/vite-plugin-mkcert). In `astro.config.mjs`, in the vite 'plugins' property, configure the `mkcert()` argument.

## Screen Size Variety Support

Small screen? No problem! This website is designed to look nice on all screen sizes. The navbar even tidies up into a collapsable menu on smaller vertical screens. When the screen becomes absurdly small, an ignorable warning appears.

## RSS Support

Supports RSS, and makes it easy to configure. It passes [RSS Validator](https://www.rssboard.org/rss-validator/) perfectly!

<a href="http://www.rssboard.org/rss-validator/check.cgi"><img src="public/images/valid-rss-rogers.png" alt="[Valid RSS]" title="Validate my RSS feed" /></a>

## Project structure

### /data

Location to use for the server to store/retrieve data that shouldn't be freely shared. Usually a database that is accessible through an API endpoint.

### /public

Astro uses this folder for static assets that are shipped 'as-is'. E.g. putting rickroll.gif in /public/very-big-secrets, makes the asset always directily accessible on `mysite.com/very-big-secrets/rickroll.gif/`. So beware what you put in there, even for a few seconds.

### /scripts

Contains scripts that are run on the server, manually for the most part.

### /src

Contains the files that astro will use to build the website.

#### /src/components

Is split into four categories, based on its abstraction and role. 'components', 'partials', 'types' and 'astro' components/partials. Use the indices 'components.ts', 'partials.ts' and 'types.ts', where everything is neatly exported... Aside from the .astro components apparently (might fix that later). Just import those directly for now.

##### /src/components/astro

Contains astro components that are rendered on the server. Components that do not need hydration, can and should be astro components, so they belong here.

##### /src/components/components

Contains React (tsx) components that serve an isolated function. Often includes recursive components (e.g. NavMenuItem), to avoid retyping the same structure.

##### /src/components/partials

Contains React (tsx) components that provide a boader function, and works out of the box when provided the correct props. Similar to the different "parts" of a page. Often makes use of multiple components (from the above directory). E.g. Hero section, contact section.

##### /src/components/types

Contains types that might be used by multiple parts of the webpage.

#### /src/config

Contains configs that allow you to easily change the data certain sections use. Those sections read and get the data from the configs in here.

#### /src/locales

Contains the translation files and the locales config. See "i18n Utility" chapter below.

#### /src/pages

Contains the pages that Astro builds. See https://docs.astro.build/en/basics/astro-pages/.

#### /src/templates

Templates that every site can use depending on their function. See https://docs.astro.build/en/basics/layouts/.

#### /src/utils

Contains utils that may run on both server and/or client. These are described below.

## Admin Page

The home admin page is found at `/admin/home/`. It requires 3 variables to be set in `.env`: `ADMIN_PASSWORD`, `JWT_KEY` which is the secret key used to generate JWTs, and `JWT_LENGTH` which is after how many seconds the token should expire (I know, unfortunate name, might rename 'length' to 'duration', but I'm too lazy now). Use `npm run createEnv <ADMIN_PASSWORD> [JWT_LENGTH]` to initially create the .env and generate a random JWT_KEY.

The admin page allows control over functions the owner might need directly over the site, removing the need to access the host machine. For example, fetching contact form submissions, or updating dynamic site data (such as an appointment table).

The `/admin/login/` page redirects to `/admin/home/` if the user already has a valid token. While the `/admin/home/` page redirects to `/admin/login/` if the user doesn't have a valid token.

## Configuring The Website

### Git

Start by creating a Git branch of this repo, or cloning it to your personal one.

If you don't work with Git, you might want to remove `commitlint` and `Husky`, since they don't work without it. Simply run `npm remove commitlint Husky` (add `--legacy-peer-deps` if necessary) and continue. If you don't use Git, you might also want to remove the .gitignore file: However, ESLint reads .gitignore to know which files to ignore. In this case, inside `eslint.config.ts`, provide a different ignore file in

```
includeIgnoreFile(process.cwd() + '/' + '.gitignore', '.gitignore patterns'),
```

or simply remove it, and append your own ignore patterns in the line below

```
globalIgnores(['.astro/', '.husky/']),
```

### Node

Start by running `npm install` (add `--legacy-peer-deps` if necessary) to install all node packages needed for the website to run. After which, you can run `npm run createEnv <ADMIN_PASSWORD> [JWT_LENGTH]` to create a .env for your admin page. Note that JWT_LENGTH is the expiry duration for a token, in seconds.

### Astro Config

Next, configure Astro correctly in `astro.config.mjs`. You probably won't have to change much, aside from the `site` property, and a few host settings for vite.

### Testing and Configuring the Website

Most things you might need for a portfolio website is already built and ready to configure and go! Before continuing, simply preview the current state of the website by running `npm run dev`. Go see how the website works, get inspiration, and most importantly: Know what you want! This guide shows you how to configure and change the most important things... But not _all_ of them!

#### Utilities

Here you can read about the different utilities in `/src/utils`, how/where they are used, and how you can use them when needed.

##### Animation Utility

Use `/src/utils/windowTools.ts` to automatically implement navigation animations on pages (fade-in on load, fade-out on unload). Use `initWindowAnimations(animationDurationMs?: number, fadeInOffsetMs?: number)` to initialize the animations, and fade in all elements with the style class `windowtools-transition`.

Also use the functions in `windowTools.ts` to manually play the animations or reload the page. These include: `windowFadeIn()`, `windowFadeOut()`, `fakeReload(callback)` (fades out, runs callback and fades in again), `initWindowAnimations()` (should run once on the client when the page loads) and `smoothScroll(targetY, durationMs)` (scrolls to `targetY` over the span of `durationMs*1000` seconds).

##### Cookies Utility

Use the functions in `/src/utils/cookies.ts` to manage cookies. Add exported functions for each cookie type for cleaner code. `cGet...` retrieves a cookie and `cSet...` sets a cookie. The utility checks if the code is run on the client or server and runs accordingly. However, make sure Astro is configured as a server in `astro.config.mjs`, or the server won't be able to fetch the cookies from the request headers.

NOTE: By default, i18n preference is communicated to the server using cookies. Enabling SSG means rewriting the i18n system, and replicating all pages for each language, which I tried to avoid by design.

##### Local Storage Utility

Use the functions in `/src/utils/localStorage.ts` to manage data locally on the client. Just like the `cookies.ts`, add a set/get function pair to set certain data. `lGet...` retrieves a locally stored string, `lSet...` sets one.

##### Actions Utility

Since you cannot pass Actions (lambdas) from Astro (the server) to the client, use `/src/utils/actions.ts` to instead pass an identifier string representing a certain function. Use that identifier string to reference and retrieve the action from the util, using `getAction(actionName: string)`.

##### Admin Utility

The `/src/util/adminTools.ts` utility provides functions related to the admin panel, mostly used for authenticating. Examples include `login(password: string)`, `logout()` and `setLogoutTimeout()`.

##### Blogs Utility

The `/src/utils/blogs.ts` utils exports functions used for fetching and sorting the blog files.

##### Data Parsing Utility

`/src/utils/dataParse.ts` is used for parsing certain data, like the date of birth.

##### i18n Utility

Use the functions in `/src/utils/i18n.ts` to retrieve translations. The i18n util reads the locale config in `/src/locales/locales.config.ts` and loads the files using their language code. E.g. listing language 'English' as `en-gb` will make the util look for `en-gb.ts` and load the file. Just make sure to use valid [BCP-47](https://gist.github.com/typpo/b2b828a35e683b9bf8db91b5404f1bd1) language codes, since the code may be used for other things, like date and time formatting.

In `Base.astro`, the fetched translation on the server is passed to the client's `window.__TRANSLATION__` object of type `ITranslation`. This makes the translation accessible from anywhere. In .astro pages (server-side), fetch the translation in every page's header, e.g. like this:

```
const translation = getTranslation(
	cGetUserLanguage(Astro) || defaultLanguageCode
);
if (!translation) {
	if (cGetUserLanguage(Astro) === null) {
		throw new Error('Could not load translations.');
	} else {
		cSetUserLanguage(null);
	}
}
```

Use the other functions in `i18n.ts` to retrieve the wanted translations. The file in `@/locales/global.ts` is used for global strings (not dependent on language). Use the `LanguageSelect` element to allow the user to change the language.

#### Translation Strings

First of all, start by configuring the `GlobalTranslation` strings in `/src/locales/global.ts`. Next, decide which languages your website should have available, and enter them accordingly in `/src/locales/locales.config.ts` in the default export object. If you only need one language, enter it, and the `LanguageSelect` element will disappear!

For every language you entered, you must provide a valid ts file in the same directory. That means, if you chose `en-gb` and `de-at`, you need the files `en-gb.ts` and `de-at.ts`, alongside the config. Just make sure to use valid [BCP-47](https://gist.github.com/typpo/b2b828a35e683b9bf8db91b5404f1bd1) language codes, since the code may be used for other things, like date and time formatting.

Each of those locale files must export a default `ITranslation` object. When adding/removing a key in the translations, first edit the `ITranslation` type in `/src/locales/global.ts`, then modify the translation files accordingly.

##### Server Side

The i18n util loads the translation files automatically based on the user's preference. You can access the prefered translation from basically anywhere. On the server side (in .astro files), simply fetch it from the util in the frontmatter using the following:

```
const translation = getTranslation(
	cGetUserLanguage(Astro) || defaultLanguageCode
);
if (!translation) {
	if (cGetUserLanguage(Astro) === null) {
		throw new Error('Could not load translations.');
	} else {
		cSetUserLanguage(null);
	}
}
```

Every page in /src/pages should have this at the top, since the Base template requires it! More about that soon.

##### Client Side

On the client side, simply use `window.___TRANSLATION___` to fetch the translation. The Base template passes the translation object to the client along with the website. A script on the client then assigns it to `window`. You can always use this reference when `window` is available (so _not_ on the server)!

#### Templates

This project consists of two base templates: `Base.astro` and `BasePost.astro`. The latter is used for rendering blog posts, while the former is used for all other pages. `BasePost.astro` also uses `Base.astro`, but with some additional logic for fetching the blog post.

##### Base.astro

Serves as the base for the website, that is visible no matter the page (or its contents). It creates the page base by doing the following:

- Creates a loader container that disappears only when the website has fully loaded (and React has hydrated)
- Creates the body element
- Creates the navbar
- Creates the `ScrollUp` component
- Creates the Footer
- Creates and shows the `SizeError` when the screen is absurdly small

It also does a few other things:

- Provides header meta
- Provides RSS links
- Sends the translation object to the client, along with a script that attaches it to window
- Creates a service worker for offline functionality
- Creates `ReactInit` object, for doing stuff inside React, that don't belong to any single component

Note that changes here affects pretty much every page, so don't rush anything here!

##### BasePost.astro

The DOM consits of the Base, with a section that renders an `<article>` element, that renders the blog post.

In the frontmatter (server-side), the blog post and its front matter is fetched, based on the url, and parsed to html using [marked](https://github.com/markedjs/marked).

#### Navbar

The navbar loads the config from `/src/config/navbar.ts`. On viewports smaller than 'sm', the navbar is placed in a collapsable menu, that can be opened by pressing the 'hamburger'.

#### 404 Page

Astro loads the 404 page, when a URL is accessed that doesn't exist on the server. The page (in the frontmatter) compares the non-existing URL to existing ones, and suggests possible close matches using [fastest-levenshtein](https://github.com/ka-weihe/fastest-levenshtein).

#### Offline Page & Offline Service Worker

The JS service worker in `/public/offline-sw.js` caches the `/offline/` site in `/src/pages/offline.astro`, and loads it when a GET request gets rejected. This service worker also works offline, once installed.

The offline page is as small as possible in size, therefore React-free, so it doens't take up too much space on the user's machine. There is also a client script to redirect the user to the home page, once the user is online again.

#### RSS

The `Base` adds two RSS links, so RSS clients know that the website can serve it, and where to look for it:

```
<link
  rel="alternate"
  type="application/rss+xml"
  title={GlobalTranslation.siteName}
  href={new URL('rss/blog.xml', Astro.site)}
/>
```

Place your RSS configs inside `/src/pages`, preferrably inside `/src/pages/rss`, and configure what they return. astro-artistic offers two different RSS channels: `blog.xml` and `events.xml`. This is what `events.xml` looks like:

```
// ..imports
export async function GET(context: APIContext) {
	const items = events_getAllEntries().map((item) => {
		return {
			title: item.title,
			description: 'Location: ' + item.location,
			link: `${context.site?.href || import.meta.env.SITE}events/`,
			pubDate: new Date()
		};
	});

	const rssResponse = await rss({
		title: `${GlobalTranslation.author}'s Events`,
		description: `${GlobalTranslation.author} event schedule.`,
		site: context.site?.href || import.meta.env.SITE,
		items: items,
		stylesheet: 'style.xsl',
		customData: '<language>en-gb</language>'
	});

	// Read rss body
	const rssBody = await rssResponse.text();

	// Apply a few fixes for best rss practice
	const modifiedBody = rssBody
		.replace(
			'<rss version="2.0">',
			'<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">'
		)
		.replace(
			'<channel>',
			`<channel><atom:link href="${context.url}" rel="self" type="application/rss+xml" />`
		);

	return new Response(modifiedBody, {
		status: 200,
		headers: { 'Content-Type': 'application/xml' }
	});
}

```

_Note that these RSS files are actually API endpoints._ Since Astro's `rss()` utility disregards atom clients, after getting the response body, we need to make a few small modifications. The first one adds a reference for atom clients, while the second one adds a link for atom clients, so they know that this is an RSS response. We then reconstruct a response with the new body.

You do _not_ have to change any of this. Instead, you can simply change the data that you pass to the `rss()` utility. You can also look at `blog.xml.ts` for another example on how to use RSS.

#### API Endpoints

In `/src/pages/api` there are a few API endpoints for different purposes: `contact.ts`, `events.ts` and `protected.ts`. `contact.ts` is used for submitting contact forms, `events.ts` for fetching the current events table, and `protected.ts` for actions with authenticated users.

`/src/pages/api/auth/login` and `/src/pages/api/auth/logout` are used for authenticating (logging in and/or out) for the admin panel. `/api/login/` attaches a new JWT token to the cookie header if provided the correct password. `/api/login/` removes that token if a request is sent.

_IMPORTANT: The password is not encrypted before it's sent. Make sure HTTPS is enabled, or don't use the admin panel._

#### Blog Posts

Blog posts should always be placed inside `/src/pages/blog`. The `/src/pages/blog/[...page].astro` page is used for listing the blog posts, and paginating all valid MD files. The posts are sorted from newest to oldest on the 'blog' page, and use the `BasePost.astro` to be themed when opened. You can change a few settings related to blog posts and their pagination in `/src/config/blog.ts`.

See `/src/pages/blog/formatting.md.example` for how the frontmatter of a post file should be formatted. To create a new post, you can run `npm run createPost [fileNameWithoutPath] [optionalTitle]` which automatically creates the file in the blog directory, writes the frontmatter fields, completes the title (if provided) and date of creation.

#### Components/Partials You Can use

##### Banner (.astro)

A banner is a full-screen-size banner to use for first presenting your page (preferably in index). It uses a large picture, with a title at the top and a button you can use to scroll down to the next section. It basically functions as the first impression of your page, and therefore, of you.

##### Card (.astro)

Used for listing information. Has a title, optional description, image and redirect button. You can also set the `alternate` prop to `true` to change the orientation of the card. (Swap text body & button with picture)

##### EventsTable (.astro)

Provides a table filled with the events entered in your data base (ideally configured using the admin site).

##### Footer (.astro)

Creates the footer, that includes a copyright notice on the left side, and two buttons on the right, one for `Site Info` and one for `Admin Page`.

##### Hero (.astro)

Similar to a card, but provides a short description about the subject person (you). Fetches configuration from the `/src/config/hero.ts` config file.

##### Pagination Buttons (.astro)

Provides buttons for paginating a page. Needs a `prevHref`, `nextHref` and `currentPageText`. If either `prevHref` or/and `nextHref` are undefined, they are made invisible.

##### Section (.astro)

Use for different sections of the site. Provides boundaries for larger content parts, so the website feels more structured. Best do not use this in components, but manually place the components themselves inside one. You never know when you may want to avoid using a section.

##### SizeError (.astro)

The `Base.astro` template employs this component to show an error screen warning the user, that their screen is smaller than the minimum recommended size. A button is provided to ignore this error, and the preference is saved as a cookie, if pressed.

##### A

A react component that provides the usual `<a></a>` element, with a few QOL buffs. When provided an `href`, and clicked, a window fade-out is played before redirecting. Of course, the window fades right back in after the href.

##### BlogCard

Used to show a card about the frontmatter of a blog. Generally, only used by `BlogGallery`.

##### Button

A react component that provides the usual `<button></button>` element, with a few QOL buffs. Serves the same as the `A` component for an `<a></a>` element, but for a `<button></button>` element.

##### DialogPopup

Provides a static class `DialogManager` for creating dialog messages. Examples: `DialogManager.error()`, `DialogManager.yesno()`, `DialogManager.form()`.

##### LanguageSelect

Provides a select element for choosing the language. Loads the available languages from `/src/locales/locales.config.ts`, and saves the preference cookie when changed.

##### MonologPopup

Similarly to `DialogPopup`, provides a static class `MonologManager` for creating monologue messages. Use `MonologManager.show()` for creating simple monologues.

##### NavMenuItem

Used by the navbar to create the navbar buttons.

##### ReactInit

Used by the `Base.astro` template to do things, that don't solely belong to an element, in the different stages of React's hydration. Also triggers the events `react-hydrated-layout` (when `useLayoutEffect()` runs) and `react-hydrated` (when `useEffect()` runs).

##### ScrollUp

A small fixed arrow button on the bottom right-hand side of the screen, that appears when the y-scroll progress is larger than 0. Used by the `Base.astro` layout.

##### BlogGallery
