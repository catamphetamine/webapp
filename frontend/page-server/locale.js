import path from 'path'

import load_locale_data from '../../code/locale (server)'

const locale_data_path = path.resolve(Root_folder, 'frontend/code/international/translations')

export default async function _load_locale_data(locales, options = {})
{
	return load_locale_data(locales, locale_data_path, options)
}