import path from 'path'

import load_locale_data from '../../../code/locale (server)'

const locale_data_path = path.resolve(Root_folder, 'backend/code/mail-service/templates/translation')

const default_translate_options = { escape: true }

export default function translator(locale)
{
	const translation = load_locale_data([locale], locale_data_path, { force_reload: process.env.NODE_ENV !== 'production' })

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

// // http://archive.oreilly.com/pub/a/actionscript/excerpts/as3-cookbook/appendix.html
// // http://stackoverflow.com/questions/39193510/how-to-insert-arbitrary-json-in-htmls-script-tag
// const escaped_symbols_json =
// {
// 	'&' : '\u0026',
// 	'<' : '\u003c',
// 	'>' : '\u003e',
// 	'"' : '\u0022',
// 	"'" : '\u0027',
// 	'/' : '\u002f'
// }

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