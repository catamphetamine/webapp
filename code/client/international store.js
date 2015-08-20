// https://github.com/gpbl/isomorphic500/blob/master/src/utils/connectToIntlStore.js

// Pass messages and locales from IntlStore down to Component as props.
// It is basically used in the /utils/Formatted* utilities to avoid the use
// of the react-intl mixin. /utils/Formatted* utilities allow to pass message
// as string instead of using this.getIntlMessage() in the components.
//
// Example
//
//  let MyComponent = connect_to_international_store(React.createClass({
//    render() {
//      console.log(this.props.messages)
//    }
//  }))

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

// import { get_message } from '../actions/locale'

import translate from './translate'

export default function connect_to_international_store(Component)
{
	@connect
	(
		store => 
		({
			messages : store.locale.messages,
			locales  : store.locale.locales
		})
	)
	class Connected extends React.Component
	{
		static PropTypes =
		{
			messages    : PropTypes.object.isRequired,
			locales     : PropTypes.array.isRequired
		}

		// const get_message = message => Object.get_value_at_path(messages, message)

		render()
		{
			const { messages, message } = this.props

			return <Component {...this.props} message={translate(messages, this.props.message)} />
		}
	}

	return Connected
}