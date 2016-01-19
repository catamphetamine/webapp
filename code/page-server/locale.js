import fs   from 'fs'
import path from 'path'

const messages_path = 'code/client/international'

export default function(locale)
{
	function load_locale_data(locale)
	{
		let locale_data_path

		locale_data_path = path.resolve(Root_folder, `${messages_path}/${locale}.js`)

		if (fs.existsSync(locale_data_path))
		{
			return { locale, messages: require(locale_data_path) }
		}

		locale_data_path = path.resolve(Root_folder, `${messages_path}/${get_language_from_locale(locale)}.js`)

		if (fs.existsSync(locale_data_path))
		{
			return { locale: get_language_from_locale(locale), messages: require(locale_data_path) }
		}
	}

	return load_locale_data(locale || 'en-US')
}