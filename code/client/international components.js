// https://github.com/gpbl/isomorphic500/blob/master/src/utils/IntlComponents.js

// Wrap react-intl's components by passing messages and locales from the IntlStore
// Supports also the message props:
// Example
//
//    <FormattedMessage message="home.welcome" />

import { FormattedMessage, FormattedDate, FormattedNumber, FormattedRelative } from 'react-intl'
import connect_to_international_store from './international store'

export default
{
	text          : connect_to_international_store(FormattedMessage),
	date          : connect_to_international_store(FormattedDate),
	number        : connect_to_international_store(FormattedNumber),
	relative_time : connect_to_international_store(FormattedRelative)
}