import { action, create_handler, state_connector } from 'react-isomorphic-render'
import settings from '../react-isomorphic-render-async'

const handler = create_handler(settings)

export const snack = action
({
	namespace : 'snack',
	event     : 'set',
	payload   : (snack, type) => ({ snack, snack_type: type }),
	result    : (state, { snack, snack_type }) =>
	({
		...state,
		snack : normalize_snack(snack, snack_type)
	})
},
handler)

function normalize_snack(snack, snack_type)
{
	if (!snack)
	{
		return
	}

	if (typeof snack === 'object' && !snack.props)
	{
		return snack
	}

	return { content: snack, type: snack_type }
}

handler.addStateProperties('snack')

// A little helper for Redux `@connect()`
export const connector = state_connector(handler)

// This is the Redux reducer
export default handler.reducer()