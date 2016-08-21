// Adds reducers for:
//
//   * "[event] pending"
//   * "[event] done"
//   * "[event] failed"
//   * "[event] reset error"
//
export function handle(handlers, namespace, event, on_result)
{
	// Redux state property base name (replace spacebars with underscores)
	const base = event.replace(/\s/g, '_')

	// When Promise is created,
	// clear `error`,
	// set `pending` flag.
	handlers[`${namespace}: ${event}: pending`] = (result, state) =>
	({
		...state,
		[`${base}_pending`] : true,
		[`${base}_error`]   : undefined
	})

	// When Promise succeeds
	handlers[`${namespace}: ${event}: done`] = (result, state) =>
	{
		// This will be the new Redux state
		let new_state

		// If `on_result` is a property name,
		// then just set that property to the value of `result`.
		if (typeof on_result === 'string')
		{
			new_state = { [on_result]: result }
		}
		// If `on_result` is a reducer, then call it,
		// and the returned object will be the new state.
		else if (typeof on_result === 'function')
		{
			new_state = on_result(result, state)

			// If the reducer function didn't return
			// the new state (which it should have done),
			// then create the new state manually.
			if (new_state === state)
			{
				new_state = { ...state }
			}
		}

		// Clear `pending` flag
		new_state[`${base}_pending`] = false

		// Return the new Redux state
		return new_state
	}

	// When Promise fails,
	// clear `pending` flag,
	// set `error`.
	handlers[`${namespace}: ${event}: failed`] = (error, state) =>
	({
		...state,
		[`${base}_pending`] : false,
		[`${base}_error`]   : error
	})

	// Clears `error`
	handlers[`${namespace}: ${event}: reset error`] = (result, state) =>
	({
		...state,
		[`${base}_error`] : undefined
	})
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