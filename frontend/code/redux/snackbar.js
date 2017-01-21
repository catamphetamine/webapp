import { action, createHandler, stateConnector } from 'react-isomorphic-render'
import settings from '../react-isomorphic-render-async'

const handler = createHandler(settings)

handler.handle('snack', (state, result) =>
({
	...state,
	snack : typeof result.snack === 'string' ? { text: result.snack } : result.snack
}))

handler.handle('snack: reset', (state, result) =>
({
	...state,
	snack : undefined
}))

handler.addStateProperties('snack')

// A little helper for Redux `@connect()`
export const connector = stateConnector(handler)

// This is the Redux reducer
export default handler.reducer()