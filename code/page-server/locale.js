import fs   from 'fs'
import path from 'path'

export default function load_locale_data(locale)
{
	function load_locale_data(locale)
	{
		const messages_path = 'code/client/international'

		let locale_data_path

		locale_data_path = path.resolve(Root_folder, `${messages_path}/${locale}.js`)

		if (fs.existsSync(locale_data_path))
		{
			return { locale: locale, messages: require(locale_data_path) }
		}

		locale_data_path = path.resolve(Root_folder, `${messages_path}/${get_language_from_locale(locale)}.js`)

		if (fs.existsSync(locale_data_path))
		{
			return { locale: locale, messages: require(locale_data_path) }
		}
	}

	const result = load_locale_data(locale)

	if (result)
	{
		return result
	}

	const default_locale = 'en-US'

	return load_locale_data(default_locale)
}