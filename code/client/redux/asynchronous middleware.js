// сработает при вызове dispatch({ promise: ... })
export default function middleware(client)
{
	return ({/* dispatch, getState */}) =>
	{
		return (next) => (action) =>
		{
			const { promise, types, ...rest } = action
      
			if (!promise)
			{
				return next(action)
			}

			// event names
			const [Request, Success, Failure] = types

			// start asynchronous request
			next({ ...rest, type: Request })

			// end asynchronous request
			return promise(client).then
			(
				(result) => next({ ...rest, result, type: Success }),
				(error)  => next({ ...rest, error,  type: Failure })
			)
		}
	}
}