// Adds reducers for:
//
//   * "[event] pending"
//   * "[event] done"
//   * "[event] failed"
//   * "[event] reset error"
//
export function handle(handlers, namespace, event, result_name)
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

// // A helper for creating Redux actions with Promises
// export function asynchronous(create_promise, event)
// {
// 	return function(...parameters)
// 	{
// 		const action =
// 		{
// 			promise : create_promise.apply(this, parameters),
// 			event
// 		}
//
// 		return action
// 	}
// }