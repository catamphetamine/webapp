import fs   from 'fs'
import path from 'path'

const messages_path = 'frontend/code/international/translations'

export default async function load_locale_data(locales, options = {})
{
	for (let locale of locales)
	{
		const _locale_data = await locale_data(locale, options)

		if (_locale_data)
		{
			return _locale_data
		}

		const locale_language_data = await locale_data(get_language_from_locale(locale), options)

		if (locale_language_data)
		{
			return locale_language_data
		}
	}

	throw new Error(`No localization found for locales: ${locales.join(', ')}`)
}

async function locale_data(locale, options)
{
	const { force_reload } = options

	const locale_data_path = path.resolve(Root_folder, `${messages_path}/${locale}.js`)

	const exists = path => new Promise((resolve, reject) => 
	{
		fs.exists(path, exists => resolve(exists))
	})

	if (require.cache[locale_data_path])
	{
		if (force_reload)
		{
			delete require.cache[locale_data_path]
		}

		return { locale, messages: require(locale_data_path) }
	}
	else if (await exists(locale_data_path))
	{
		return { locale, messages: require(locale_data_path) }
	}
}