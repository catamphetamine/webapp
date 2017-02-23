import { action, create_handler, state_connector } from 'react-isomorphic-render'
import settings from '../react-isomorphic-render-async'

const handler = create_handler(settings)

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
export const connector = state_connector(handler)

// This is the Redux reducer
export default handler.reducer()