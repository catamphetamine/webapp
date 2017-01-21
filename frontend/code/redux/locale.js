import { action, createHandler, stateConnector } from 'react-isomorphic-render'
import settings from '../react-isomorphic-render-async'

const handler = createHandler(settings)

handler.handle('locale', (state, result) =>
({
	...state,
	locale : result.locale
}))

handler.addStateProperties('locale')

// A little helper for Redux `@connect()`
export const connector = stateConnector(handler)

// This is the Redux reducer
export default handler.reducer()