import { defineMessages, FormattedMessage } from 'react-intl'
import React_time_ago from 'react-time-ago'

export const messages = defineMessages
({
	authentication_attempts_limit_exceeded_error:
	{
		id             : 'authentication.error.authentication_attempts_limit_exceeded',
		description    : `The user's authentication attempts limit has been reached. The user should try again in 15 minutes or so. "cooldown" variable is relative time like "in 5 minutes" or "in an hour"`,
		defaultMessage : `Authentication attempts limit exceeded. Try again {cooldown}. In case of feeling desperate contact support by email: {support_email}`
	}
})

export function authentication_attempts_limit_exceeded_error(error)
{
	return <FormattedMessage
		{ ...messages.authentication_attempts_limit_exceeded_error }
		values={ {
			cooldown: <React_time_ago>{ Date.now() + error.cooldown }</React_time_ago>,
			support_email: <a href={ `mailto:${configuration.support.email}` }>{ configuration.support.email }</a>
		} }
		tagName="p"/>
}