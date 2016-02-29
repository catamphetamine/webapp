import path          from 'path'
import socket_io     from 'socket.io'

import web_server from '../common/web server'

const web = web_server({  })

// serve assets
web.serve_static_files('/assets', path.join(Root_folder, 'build', 'assets'))

// remove this after fixing the "simple example" page
web.serve_static_files('/temporary_storage', path.join(Root_folder, configuration.image_service.temporary_files_directory))

// serve uploaded files (pictures, etc)
web.serve_static_files('/storage', path.join(Root_folder, configuration.upload_folder))

// if it's not a static file url:

// Proxy /authentication requests to API server
web.proxy('/authentication', address_book.authentication_service)

// Proxy /users requests to user-service
web.proxy('/users', address_book.user_service)

// Proxy /api requests to API server
web.proxy('/api', address_book.api_service)

// Proxy /images requests to Image server
web.proxy('/upload_image', address_book.image_service)

// Proxy /log requests to Log server
web.proxy('/log', address_book.log_service)

// Proxy all the rest requests to Webpage rendering server
web.proxy(address_book.webpage_server)

// // websocket server
// const websocket = socket_io.listen(http_web_server)
// // don't serve client scripts
// websocket.serveClient(false)

// websocket.on('connection', socket =>
// {
// 	socket.emit('news', { message: `'Hello World!' from server` })
// 	socket.on('something', data =>
// 	{
// 		log.info(data)
// 	})
// })

// поднять http сервер
web.listen(configuration.web_server.http.port).then(() =>
{
	log.info(`Web server is listening`)
	log.info(`Now go to http://${configuration.web_server.http.host}:${configuration.web_server.http.port}`)
},
error =>
{
	log.error(error)
})