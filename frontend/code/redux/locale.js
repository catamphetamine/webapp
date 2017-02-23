import { action, create_handler, state_connector } from 'react-isomorphic-render'
import settings from '../react-isomorphic-render-async'

const handler = create_handler(settings)

handler.handle('locale', (state, result) =>
({
	...state,
	locale : result.locale
}))

handler.addStateProperties('locale')

export const set_locale = action
({
	namespace: 'locale',
	event: 'set',
	action(locale, http)
	{
		return http.post('/users/locale', { locale })
	}
},
handler)

// A little helper for Redux `@connect()`
export const connector = state_connector(handler)

// This is the Redux reducer
export default handler.reducer()