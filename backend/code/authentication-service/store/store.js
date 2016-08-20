import moment from 'moment'

import Mongodb_store from './mongodb store'
import Memory_store  from './memory store'

export default configuration.mongodb ? new Mongodb_store() : new Memory_store()

// user's latest activity time accuracy
export function round_user_access_time(time)
{
	return new Date(moment(time).seconds(0).unix() * 1000)
}