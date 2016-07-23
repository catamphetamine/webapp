import path        from 'path'
import web_service from '../common/webservice'

const web = web_service
({
	// // since the following services are local,
	// // and write errors to the same log,
	// // there's no need to duplicate those errors in the log
	// show_proxy_errors:
	// {
	// 	[address_book.authentication_service] : false,
	// 	[address_book.user_service]           : false,
	// 	[address_book.api_service]            : false,
	// 	[address_book.image_service]          : false,
	// 	[address_book.log_service]            : false,
	// 	[address_book.webpage_server]         : false
	// },
})

// serve assets
web.files('/assets', path.join(Root_folder, 'build', 'assets'))

// remove this after fixing the "simple example" page
web.files('/temporary_storage', path.join(Root_folder, configuration.image_service.temporary_files_directory))

// if it's not a static file url:

// Proxy /authentication requests to API server
web.proxy('/authentication', address_book.authentication_service, { to_name: 'Authenication service' })

// Proxy /users requests to user-service
web.proxy('/users', address_book.user_service, { to_name: 'User service' })

// Proxy /api requests to API server
web.proxy('/api', address_book.api_service, { to_name: 'API service' })

// Proxy /images requests to Image server
web.proxy('/images', address_book.image_service, { to_name: 'Image service' })

// Proxy /log requests to Log server
web.proxy('/log', address_book.log_service, { to_name: 'Log service' })

// Proxy all the rest requests to Webpage rendering server
web.proxy(address_book.webpage_server, { to_name: 'Page rendering service' })

// поднять http сервер
web.listen(configuration.web_server.http.port).then(() =>
{
	log.info(`Web server is listening`)
	log.info(`Now go to http://${configuration.web_server.http.host}:${configuration.web_server.http.port}`)
},
error =>
{
	log.error(error, 'Web server shutdown')
})