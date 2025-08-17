# Astro Artistic

This website (template) is a design meant for portfolios used in an _artistic_ setting, technically based on [astro-boilerplate](https://github.com/ixartz/Astro-boilerplate) (though it's been changed so much, that it's basically a completely different page now). It features a simple and clean look, with smooth animations for a fluid navigation feeling. It also supports _i18n_, where the strings are saved in .ts files.

The goal of this template is to provide a functional, but expandable website that anyone with a bit of experience can use to customize to their heart's content. It provides a strong base, but makes any large modifications easy, and smaller ones even easier. Pretty much everything is configurable, as long as you understand 1. how everything works, and 2. the structure of the project.

## Features

### Tailwind CSS

The large majority of styling is done with [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss), with very little exceptions. It takes very little getting used to, removes the need for time-consuming (and annoying) style classes, and is simply practical. _If you don't like it: You're on your own, regarding styles._

### ESLint

This project is also setup with [ESLint](https://github.com/eslint/eslint) for code delinting of Astro, React, Typescript, Javascript, JSON, JSONc and JSON5 files. It includes many useful plugins, and many rules custom set, for easy customization. It also includes some custom rules, which I created to suit my coding style... Though, I'm sure many of you won't like them - so just feel free to delete them and remove the from the config.

### Husky and commitlint

[commitlint](https://github.com/conventional-changelog/commitlint) is used in combination with [Husky](https://github.com/typicode/husky) to validate commits before continuing. Use [Angular conventional commit](https://www.conventionalcommits.org/en/v1.0.0-beta.4/) messages.

### Zod

This project uses [zod](https://zod.dev/) for runtime type validation. It is a very useful tool for picking out small errors that might otherwise cause a headache to debug. All Zod values (schemas) are prefixed with a `Z`. So `ZBlogConfig` and `ZBlogConfig` are both Zod schemas that can be used to parse objects.

### HTTPS Dev Server

Certificates are automatically generated using [vite-plugin-mkcert](https://github.com/liuweiGL/vite-plugin-mkcert). In `astro.config.mjs`, in the vite 'plugins' property, configure the `mkcert()` argument.

### Screen Size Variety Support

Small screen? No problem! This website is designed to look nice on all screen sizes. The navbar even tidies up into a collapsable menu on smaller vertical screens. When the screen becomes absurdly small, an ignorable warning appears.

### RSS Support

Supports RSS, and makes it easy to configure. It passes [RSS Validator](https://www.rssboard.org/rss-validator/) perfectly!

<a href="http://www.rssboard.org/rss-validator/check.cgi"><img src="public/images/valid-rss-rogers.png" alt="[Valid RSS]" title="Validate my RSS feed" /></a>

## Project Structure

Here's a high-level overview of the project structure:

-	`/src`: Contains the source code of your website.
	-	`/src/pages`: Astro pages and API endpoints. This is where you create new pages for your site.
	-	`/src/components`: Reusable Astro and React components.
		- `/src/components/astro-components`: Astro components, which are rendered on the server. Prefer this over React hydration.
		- `/src/components/components`: Smaller React components, usually used in larger blocks.
		- `/src/components/partials`: Larger React blocks, that usually handle a specific job.
	-	`/src/backend`: Backend logic for handling data, actions, and more.
	-	`/src/shared`: Files accessible to both backend and frontend logic.
	-	`/src/locales`: Translation files for internationalization (i18n).
	-	`/src/styles`: Global CSS styles.
	-	`/src/templates`: Base layouts for your pages.
-	`/public`: Static assets that are served as-is (e.g., images, favicon).
-	`/scripts`: Utility scripts for automating tasks.
-	`/data`: Directory for server-side data storage (e.g., databases).

## Getting Started

1.	**Clone the repository:**
	```bash
	git clone https://github.com/Ctrl-Shift-Alvin/astro-artistic.git
	```

2.	**Install dependencies:**
	```bash
	npm install
	```

34.	**Start the development server:**
	```bash
	npm run dev
	```
	Your website will be available at `https://localhost:4321`.

## Configuration

Use `astro.config.mjs` to configure Astro and Vite. The i18n logic relies completely on cookies, so currently, the project can only be built as a server.

Most of the website's content and behavior can be configured by editing the config files in the `/src/shared/config` or `/src/backend/config` directory.

-	**`/src/shared/config/navbar.ts`**: Configure the links in the navigation bar.
-	**`/src/shared/config/hero.ts`**: Configure the content of the hero section on the homepage.
-	**`/src/shared/config/blog.ts`**: Configure blog settings, such as the number of posts per page.
-	**`/src/shared/config/events.ts`**: Configure event settings.
-	**`/src/shared/config/contact.ts`**: Configure contact form settings.

## Workflow

### Creating .env

Run the following command to create a `.env` file with a password for the admin page and a JWT secret key:
```bash
npm run createEnv <YOUR_ADMIN_PASSWORD>
```
Omitting the .env file, or not providing the necessary values, disables the admin page cleanly.

### Creating Blog Posts

To create a new blog post, run the following command:

```bash
npm run createPost "My New Post"
```

This will create a new Markdown file in `/src/pages/blog`. You can then edit the file to add your content. The frontmatter of the Markdown file is used to set the title, description, and other metadata for the post.

### Managing Events

Events are managed through the admin page. You can add, edit, and delete events from the admin dashboard.

If you want to omit the admin page, you will need to manually edit the database in (default) `/data/events.db`. Check `/src/backend/database/events.ts` for the structure and workings of the events DB. You may also use a script that calls the functions from that file.

For event entries that have `enablePage` set to `true`, the server expects a file named `{id}.md` inside the expected URL (set using the config file).

### Internationalization (i18n)

This template supports multiple languages. To add a new language, you need to:

1.	Add the language to the `locales.config.ts` file in `/src/locales`.
2.	Create a new translation file (e.g., `fr.ts`) in the `/src/locales` directory. This file should export a default object with the translated strings.

The website will remember the user's language choice using cookies, while the server will read those, and provide the correct language.


### Cookies

Use the cookies utility in `src/shared/cookies.ts` for cleanly getting, setting and clearing cookies. Functions related to cookies are prefixed with a `c`. For example, `cGetAuthToken` gets the cookie related to the auth token.

Functions that run on the backend, need the Astro context (either the `Astro` object in .astro file, or an `APIContext` object in API endpoints) to work properly. So either require an `APIContext` for functions that should run only on the backend, make it optional for both, or reqire zero arguments for functions that should run only on the frontend.

E.g. `export function cGetIgnoreSizeError(context?: APIContext): boolean | null ...` can be called both from backend and frontend (optional Astro object).

`export function cSetIgnoreSizeError(value: boolean | null) ...` can be called only from the frontend (no Astro object).

`export function cGetAuthToken(context: APIContext): string | null ...` can be called only from backend (required Astro object).

Use the `Cookies` class to create a cookie and pass it around, and the helper functions, that work correctly both on the frontend and backend (only and always pass the Astro object on the backend): `setCookie(cookie: Cookie, context?: APIContext)`, `getCookie(name: string, context?: APIContext)` and `removeCookie(name: string, context?: APIContext)`.


## Admin Page

The admin page is available at `/admin/home/`. It allows you to:

-	View contact form submissions.
-	Add, remove and edit event entries and page content.
-	Add, remove and edit blog posts.

You will need to log in with the password you set in the `.env` file.

## Deployment

To build your website for production, run the following command:

```bash
npm run build
```

This will create a `dist` directory with the optimized files. You can then deploy this directory to your hosting provider, or host it yourself.