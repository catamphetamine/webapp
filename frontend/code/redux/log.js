import { action, create_handler, state_connector } from 'react-isomorphic-render'
import settings from '../react-isomorphic-render-async'
import { log_level_values } from '../../../code/log levels'

const handler = create_handler(settings)

export const get = action
({
	namespace : 'log',
	event     : 'fetch',
	action    : http => http.get('/log'),
	result    : 'log'
},
handler)

export const error   = (...parameters) => post_log(parameters, 'Error')
export const warning = (...parameters) => post_log(parameters, 'Warning')
export const info    = (...parameters) => post_log(parameters, 'Generic')

export const post_log = (parameters, level) =>
{
	const entry =
	{
		level: log_level_values[level]
	}

	const message = []

	for (let parameter of parameters)
	{
		if (parameter instanceof Error)
		{
			entry.err =
			{
				message : parameter.message,
				name    : parameter.name,
				stack   : parameter.stack
			}
		}
		else
		{
			message.push(parameter)
		}
	}

	if (message.not_empty())
	{
		entry.msg = message.join(' ')
	}
	else if (entry.err)
	{
		entry.msg = entry.err.message
	}

	const action =
	{
		promise : http => http.post('/log', entry),
		event   : 'log: post'
	}

	return action
}

// A little helper for Redux `@connect()`
export const connector = state_connector(handler)

// This is the Redux reducer
export default handler.reducer()