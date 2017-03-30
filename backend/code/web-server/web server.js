import path        from 'path'
import web_service from '../common/webservice'

export default function start_web_server()
{
	const web = web_service
	({
		// // since the following services are local,
		// // and write errors to the same log,
		// // there's no need to duplicate those errors in the log
		// show_proxy_errors:
		// {
		// 	[address_book.authentication_service] : false,
		// 	[address_book.user_service]           : false,
		// 	[address_book.image_service]          : false,
		// 	[address_book.log_service]            : false,
		// 	[address_book.webpage_server]         : false
		// },
	})

	// // Web browsers query "favicon.ico" automatically (301 Moved Permanently)
	// web.redirect('/favicon.ico', { to: '/assets/images/icon/cat_64x64.png', exact: true })

	// Serve assets
	web.files('/assets', path.join(Root_folder, 'frontend/build/assets'))

	// Remove this after fixing the "simple example" page
	web.files('/temporary_storage', path.join(Root_folder, configuration.image_service.temporary_files_directory))

	// If it's not a static file url:

	// Proxy /authentication requests to API server
	web.proxy('/authentication', address_book.authentication_service, { name: 'Authenication service' })

	// Proxy /social requests to social-service
	web.proxy('/social', address_book.social_service, { name: 'Social service' })

	// Proxy /users requests to user-service
	web.proxy('/users', address_book.user_service, { name: 'User service' })

	// Proxy /images requests to Image server
	web.proxy('/images', address_book.image_service, { name: 'Image service' })

	// Proxy /log requests to Log server
	web.proxy('/log', address_book.log_service, { name: 'Log service' })

	// Proxy all the rest requests to Webpage rendering server
	web.proxy(address_book.webpage_server, { name: 'Page rendering service' })

	// поднять http сервер
	return web.listen(configuration.web_server.http.port).then(() =>
	{
		log.info(`Web server is listening`)
		log.info(`Now go to http://${configuration.web_server.http.host || 'localhost'}:${configuration.web_server.http.port}`)

		return web
	},
	error =>
	{
		log.error(error, 'Web server shutdown')
	})
}