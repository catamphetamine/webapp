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
	FormattedMessage  : connect_to_international_store(FormattedMessage),
	FormattedDate     : connect_to_international_store(FormattedDate),
	FormattedNumber   : connect_to_international_store(FormattedNumber),
	FormattedRelative : connect_to_international_store(FormattedRelative)
}