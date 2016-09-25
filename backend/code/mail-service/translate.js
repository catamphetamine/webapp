import path from 'path'

import load_locale_data from '../../../code/locale (server)'

const locale_data_path = path.resolve(Root_folder, 'backend/code/mail-service/templates/translation')

export default async function translator(locale)
{
	const translation = await load_locale_data([locale], locale_data_path, { force_reload: _development_ })

	return function translate(key, parameters)
	{
		return escape_html(apply_parameters(translation.messages[key] || key, parameters))
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

function escape_html(text)
{
	return String(text).replace(/[&<>"'\/]/g, symbol => escaped_symbols[symbol])
}