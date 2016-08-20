export function add_reducers(handlers, namespace, event, result_name)
{
	const base = event.replace(/\s/g, '_')

	handlers[`${namespace}: ${event} pending`] = (result, state) =>
	{
		const new_state = 
		{
			...state,
			[`${base}_pending`] : true,
			[`${base}_error`]   : undefined
		}

		return new_state
	}

	handlers[`${namespace}: ${event} done`] = (result, state) =>
	{
		const new_state = 
		{
			...state,
			[`${base}_pending`] : false
		}

		if (result_name)
		{
			new_state[result_name] = result
		}

		return new_state
	}

	handlers[`${namespace}: ${event} failed`] = (error, state) =>
	{
		const new_state = 
		{
			...state,
			[`${base}_pending`] : false,
			[`${base}_error`]   : error
		}

		return new_state
	}

	handlers[`${namespace}: ${event} reset error`] = (result, state) =>
	{
		const new_state = 
		{
			...state,
			[`${base}_error`] : undefined
		}

		return new_state
	}
}