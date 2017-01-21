import { action, createHandler, stateConnector } from 'react-isomorphic-render'
import settings from '../../react-isomorphic-render-async'

const handler = createHandler(settings)

export const generate_block_user_token = action
({
	namespace : 'block user',
	event     : 'generate token',
	action    : (user_id, http) => http.post(`/users/block-user-token`, { user_id })
},
handler)

export const get_block_user_token = action
({
	namespace : 'block user',
	event     : 'get token',
	action    : (token_id, http) => http.get(`/users/block-user-token/${token_id}`),
	result    : 'token'
},
handler)

export const block_user = action
({
	event  : 'block user',
	action : (id, token_id, reason, http) => http.post(`/users/block`,
	{
		id,
		token : token_id,
		reason
	})
},
handler)

export const unblock_user = action
({
	event  : 'unblock user',
	action : (id, token_id, reason, http) => http.post(`/users/unblock`,
	{
		id,
		token : token_id,
		reason
	})
},
handler)

// A little helper for Redux `@connect()`
export const connector = stateConnector(handler)

// This is the Redux reducer which now
// handles the asynchronous actions defined above.
export default handler.reducer()