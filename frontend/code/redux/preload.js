import { Preload_started, Preload_finished, Preload_failed } from 'react-isomorphic-render'
import { action, create_handler, state_connector } from 'react-isomorphic-render'
import settings from '../react-isomorphic-render-async'

const handler = create_handler(settings)

export const preload_started = () =>
({
	type      : Preload_started,
	immediate : true
})

handler.handle(Preload_started, (state, result) =>
({
	...state,
	pending   : true,
	error     : false,
	immediate : result.immediate
}))

handler.handle(Preload_finished, (state, result) =>
({
	...state,
	pending : false
}))

handler.handle(Preload_failed, (state, result) =>
({
	...state,
	pending : false,
	error   : true
}))

// A little helper for Redux `@connect()`
export const connector = state_connector(handler)

// This is the Redux reducer
export default handler.reducer()