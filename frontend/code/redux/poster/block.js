import { action, create_handler, state_connector } from 'react-isomorphic-render'
import settings from '../../react-isomorphic-render-async'

const handler = create_handler(settings)

export const generate_block_poster_token = action
({
	namespace : 'block poster',
	event     : 'generate token',
	action    : (poster_id, http) => http.post(`/social/poster/${poster_id}/block-poster-token`)
},
handler)

export const get_block_poster_token = action
({
	namespace : 'block poster',
	event     : 'get token',
	action    : (poster_id, token_id, http) => http.get(`/social/poster/${poster_id}/block-poster-token/${token_id}`),
	result    : 'token'
},
handler)

export const block_poster = action
({
	event  : 'block poster',
	action : (poster_id, token_id, reason, http) => http.post(`/social/poster/${poster_id}/block`,
	{
		token_id,
		reason
	})
},
handler)

export const unblock_poster = action
({
	event  : 'unblock poster',
	action : (id, token_id, reason, http) => http.post(`/social/poster/unblock`,
	{
		id,
		token : token_id,
		reason
	})
},
handler)

// A little helper for Redux `@connect()`
export const connector = state_connector(handler)

// This is the Redux reducer which now
// handles the asynchronous actions defined above.
export default handler.reducer()