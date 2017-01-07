// https://github.com/gpbl/isomorphic500/blob/master/src/utils/IntlUtils.js

// Contains utils to download the locale data for the current language, eventually
// requiring the `Intl` polyfill for browser not supporting it
// It is used in client.js *before* rendering the root component.

import { addLocaleData as add_locale_data } from 'react-intl'
import javascript_time_ago from 'javascript-time-ago'
import is_intl_locale_supported from 'intl-locales-supported'

import { get_language_from_locale } from '../../../code/locale'

// `react-intl` is already used in the project,
// so it initialized its internal `intl-messageformat`
// during `add_locale_data()` function call.
//
// https://github.com/yahoo/react-intl/blob/54d40377e1f6c2daf27030a8a5cda4cd2530060e/src/locale-data-registry.js#L15
//
// However, I guess, that's just
// the internal instance of `intl-messageformat`
// that gets localized, so a global instance
// of `intl-messageformat` is initialized here too.
//
require('javascript-time-ago/intl-messageformat-global')

// doesn't matter, just initialize it with something
// (this variable is for Webpack Hot Module Replacement)
let _locale = 'en'

// console output for debugging purposes
const debug = (...parameters) => { console.log.bind(console)(parameters) }

const international =
{
	// client-side bootstrap code
	//
	// load the Intl polyfill and its locale data before rendering the application
	load(locale)
	{
		// language
		locale = locale || document.documentElement.getAttribute('lang') || 'en'

		return international.load_polyfill(locale)
			.then(international.load_locale_data.bind(null, locale))
	},

	// Returns a promise which is resolved when Intl has been polyfilled
	load_polyfill(locale)
	{
		if (window.Intl && is_intl_locale_supported(locale))
		{
			// all fine: Intl is in the global scope and the locale data is available
			return Promise.resolve()
		}

		return new Promise((resolve) =>
		{
			debug(`Intl or locale data for "${locale}" not available, downloading the polyfill...`)

			// do not remove code duplication (because Webpack won't work as expected)
			switch (get_language_from_locale(locale))
			{
				// russian
				case 'ru':
					// When building: create a intl chunk with webpack
					// When executing: run the callback once the chunk has been download.
					require.ensure
					([
						'intl',
						'intl/locale-data/jsonp/ru.js'
					],
					(require) =>
					{
						// apply the polyfill
						require('intl')
						require('intl/locale-data/jsonp/ru.js')
						debug(`Intl polyfill for "${locale}" has been loaded`)
						resolve()
					},
					'intl')
					break

				default:
					// When building: create a intl chunk with webpack
					// When executing: run the callback once the chunk has been download.
					require.ensure
					([
						'intl',
						'intl/locale-data/jsonp/en.js'
					],
					(require) =>
					{
						// apply the polyfill
						require('intl')
						require('intl/locale-data/jsonp/en.js')
						debug(`Intl polyfill for "${locale}" has been loaded`)
						resolve()
					},
					'intl')
			}
		})
	},

	// Returns a promise which is resolved as the required locale-data chunks
	// has been downloaded with webpack's require.ensure. For each language,
	// we make two different chunks: one for browsers supporting `intl` and one
	// for those who don't.
	// The react-intl locale-data is required, for example, by the FormattedRelative
	// component.
	load_locale_data(locale)
	{
		// Make sure ReactIntl is in the global scope: this is required for adding locale-data
		// Since ReactIntl needs the `Intl` polyfill to be required (sic) we must place
		// this require here, when loadIntlPolyfill is supposed to be present
		require('expose-loader?ReactIntl!react-intl')

		// The require.ensure function accepts an additional 3rd parameter.
		// This must be a string.
		// If two split point pass the same string they use the same chunk.

		return new Promise(resolve =>
		{
			// do not remove code duplication (because Webpack won't work as expected)
			switch (get_language_from_locale(locale))
			{
				// russian
				case 'ru':
					// download react-intl specific locale data for this language
					require.ensure
					([
						'react-intl/locale-data/ru',

						'intl-messageformat/dist/locale-data/ru',
						'javascript-time-ago/locales/ru'
					],
					require =>
					{
						add_locale_data(require('react-intl/locale-data/ru'))
						debug(`ReactIntl locale-data for "${locale}" has been downloaded`)

						require('intl-messageformat/dist/locale-data/ru')
						javascript_time_ago.locale(require('javascript-time-ago/locales/ru'))

						resolve()
					},
					'locale-ru')
					break

				// english
				default:
					// download intl locale data for this language
					require.ensure
					([
						// (is hardcoded into `react-intl`)
						// 'react-intl/locale-data/en',

						'intl-messageformat/dist/locale-data/en',
						'javascript-time-ago/locales/en'
					],
					require =>
					{
						// (is hardcoded into `react-intl`)
						// add_locale_data(require('react-intl/locale-data/en'))
						// debug(`ReactIntl locale-data for "${locale}" has been downloaded`)

						require('intl-messageformat/dist/locale-data/en')
						javascript_time_ago.locale(require('javascript-time-ago/locales/en'))

						resolve()
					},
					'locale-en-with-intl')
			}
		})
	},

	// This is purely for Webpack HMR in dev mode
	load_translation: locale =>
	{
		// makes Webpack HMR work for this locale for now
		_locale = locale

		switch (get_language_from_locale(locale))
		{
			case 'ru':
				return import('./translations/ru').then(module => module.default)

			default:
				return import('./translations/en').then(module => module.default)
		}
	},

	hot_reload: on_reload =>
	{
		// `process.env.NODE_ENV !== 'production'` flag is needed here
		// to make sure that Webpack doesn't include
		// the whole `./international` folder into the `main` bundle
		// in production mode (because that's the sole point of code splitting)
		//
		if (process.env.NODE_ENV !== 'production' && module.hot)
		{
			module.hot.accept(require.resolve('./translations/' + _locale + '.js'), function()
			{
				on_reload()
			})
		}
	}
}

export default international