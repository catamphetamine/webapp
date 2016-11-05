import { log_level_values } from '../../../code/log levels'

export const get = () =>
({
	promise : http => http.get('/log'),
	event   : 'log: fetch'
})

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