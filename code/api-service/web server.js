import api_server from '../common/api server'

api_server({ name: 'API', authentication: true }).start(configuration.api_service.http)