import start_websocket_service from './websocket service'
import start_web_service from './web service'

// First start HTTP REST API, then start websocket service,
// because this way it is 100% assured that the API
// will be accepting notification pushes
// when the user connects to websocket service
// and gets his `notifications`.
// Therefore no notifications pushed from other services
// via HTTP REST API will be lost.
// (and for that to happen the notifications must be sent
//  after the database has been written to which comes natural)
catch_errors(start_web_service().then(start_websocket_service))