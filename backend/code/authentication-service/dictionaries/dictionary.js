import path from 'path'
import fs   from 'fs'

import { get_language_from_locale } from '../../../../code/locale'

const dictionaries =
{
	en : load_dictionary('en'),
	ru : load_dictionary('ru')
}

// Picks a random word from a dictionary
// for this locale (if any, english otherwise)
export default function get_word(locale)
{
	const language = get_language_from_locale(locale)
	const dictionary = dictionaries[language] || dictionaries.en
	return dictionary.random()
}

function load_dictionary(locale)
{
	return fs.readFileSync(path.join(__dirname, `locales/${locale}.txt`), 'utf8').split('\n')
}