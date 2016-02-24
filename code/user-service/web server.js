import api_server from '../common/api server'

api_server
({
	name: 'Users',
	authentication: true
})
.start(configuration.user_service.http)