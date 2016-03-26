var configuration = require('./configuration')

module.exports =
{
	_websocket_url_: configuration.web_server.http.host + ':' + configuration.web_server.http.port,
	_image_service_url_: configuration.web_server.image_service_path,
	_user_pictures_path_: configuration.image_service.target.user_picture.path
}