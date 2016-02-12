import api_server from '../common/api server'

api_server
({
	name: 'Authentication',
	authentication: configuration.authentication_token_payload.read || (() => ({})),
	secret: true
})
.start(configuration.authentication_service.http)