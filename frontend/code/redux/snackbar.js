import { action, createHandler, stateConnector } from 'react-isomorphic-render'
import settings from '../react-isomorphic-render-async'

const handler = createHandler(settings)

export const snack = action
({
	namespace : 'snack',
	event     : 'set',
	payload   : snack => ({ snack }),
	result    : (state, { snack }) =>
	({
		...state,
		snack : typeof snack === 'string' ? { text: snack } : snack
	})
},
handler)

handler.addStateProperties('snack')

// A little helper for Redux `@connect()`
export const connector = stateConnector(handler)

// This is the Redux reducer
export default handler.reducer()