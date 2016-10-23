import path from 'path'

import load_locale_data from '../../../code/locale (server)'

const locale_data_path = path.resolve(Root_folder, 'backend/code/mail-service/templates/translation')

const default_translate_options = { escape: true }

export default async function translator(locale)
{
	const translation = await load_locale_data([locale], locale_data_path, { force_reload: _development_ })

	return function translate(key, parameters, options = {})
	{
		options = { ...default_translate_options, ...options }

		const result = apply_parameters(translation.messages[key] || key, parameters)

		return options.escape ? escape_html(result) : result
	}
}

// "This is a {parameter}"
function apply_parameters(text, parameters)
{
	if (!parameters)
	{
		return text
	}

	return text.replace(/\{([^\}]*)\}/g, (text, parameter) => parameters[parameter] !== undefined ? parameters[parameter] : parameter)
}

const escaped_symbols =
{
	'&' : '&amp;',
	'<' : '&lt;',
	'>' : '&gt;',
	'"' : '&quot;',
	"'" : '&#39;',
	'/' : '&#x2F;'
}

export function escape_html(text)
{
	return String(text).replace(/[&<>"'\/]/g, symbol => escaped_symbols[symbol])
}