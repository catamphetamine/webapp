import api_server from '../common/api server'

api_server
({
	name: 'Authentication',
	authentication: true,
	secret: true
})
.start(configuration.authentication_service.http)