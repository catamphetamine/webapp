import api_server from '../common/api server'

api_server
({
	name: 'API',
	authentication: configuration.authentication_token_payload.read || () => ({})
})
.start(configuration.api_service.http)