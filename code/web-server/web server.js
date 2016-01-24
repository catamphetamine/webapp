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
web.proxy('/authentication', `http://${configuration.authentication_service.http.host}:${configuration.authentication_service.http.port}`)

// Proxy /api requests to API server
web.proxy('/api', `http://${configuration.api_service.http.host}:${configuration.api_service.http.port}`)

// Proxy /images requests to Image server
web.proxy('/upload_image', `http://${configuration.image_service.http.host}:${configuration.image_service.http.port}`)

// Proxy /log requests to Log server
web.proxy('/log', `http://${configuration.log_service.http.host}:${configuration.log_service.http.port}`)

// Proxy all the rest requests to Webpage rendering server
web.proxy(`http://${configuration.webpage_server.http.host}:${configuration.webpage_server.http.port}`)

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