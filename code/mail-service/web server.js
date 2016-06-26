import api_server from '../common/api server'

api_server
({
	name: 'Mail',
	authentication: true,
	access_list: configuration.mail_service.access_list
})
.start(configuration.mail_service.http)