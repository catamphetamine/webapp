import Memory_online_status_store from './memory online store'
import Redis_online_status_store  from './redis online store'

export default configuration.redis ? new Redis_online_status_store() : new Memory_online_status_store()