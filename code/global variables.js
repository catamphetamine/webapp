import configuration from './configuration'

module.exports =
{
	_image_service_url_: configuration.web_server.image_service_path,
	_poster_pictures_path_: configuration.image_service.type.poster_picture.path,
	_access_token_cookie_: configuration.access_token_cookie,
	_access_token_refresh_cookie_: configuration.access_token_refresh_cookie
}