import Stream from 'stream'

import log           from '../../../code/log'
import message_store from './message store'

const direct_logger = new Stream()
direct_logger.writable = true

direct_logger.write = data =>
{
	message_store.add(data)
}

export default log('webapp log server',
{
	use_log_server: false,
	extra_streams: [direct_logger]
})