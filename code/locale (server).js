import path from 'path'
import fs from 'fs-extra'

import { get_language_from_locale } from './locale'

const fs_exists_cache = {}

export default function cache_locale_data(locale_data_path)
{
	const cache = []

	for (let file of fs.readdirSync(locale_data_path))
	{
		if (file.ends_with('.json') || file.ends_with('.js'))
		{
			cache.push(file)

			// Cache it in Node.js's internal `require.cache`
			require(path.join(locale_data_path, file))
		}
	}

	fs_exists_cache[locale_data_path] = cache
}

export default function load_locale_data(locales, locale_data_path, options = {})
{
	// Cache all existing *.json files in the directory
	if (!fs_exists_cache[locale_data_path] || options.force_reload)
	{
		cache_locale_data(locale_data_path)
	}

	// For each preferred locale
	// search for an appropriate *.json file
	// containing translation.
	for (let locale of locales)
	{
		// The *.json file containing translation for this exact locale
		const _locale_data = locale_data(locale, locale_data_path, options)

		if (_locale_data)
		{
			return { locale, messages: _locale_data }
		}

		// Fallback to just the language of the desired locale
		const language = get_language_from_locale(locale)

		// The *.json file containing translation for the language of this locale
		const locale_language_data = locale_data(language, locale_data_path, options)

		if (locale_language_data)
		{
			return { locale: language, messages: locale_language_data }
		}
	}

	throw new Error(`No translation found for locales: ${locales.join(', ')}`)
}

// Reads translation *.json file for this exact locale
function locale_data(locale, locale_data_path, options)
{
	const cache = fs_exists_cache[locale_data_path]

	let file = `${locale}.json`

	if (!cache.has(file))
	{
		file = `${locale}.js`

		if (!cache.has(file))
		{
			return
		}
	}

	// Translation file path
	const file_path = `${locale_data_path}/${file}`

	// Refresh translation file in development mode
	if (options.force_reload)
	{
		delete require.cache[file_path]
	}

	// Is retrieved from cache in production mode
	return require(file_path)
}

// // Does the path exist
// function exists(path)
// {
// 	return new Promise((resolve, reject) =>
// 	{
// 		fs.exists(path, exists => resolve(exists))
// 	})
// }