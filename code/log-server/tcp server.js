import net from 'net'

const server = net.createServer(socket =>
{
	socket.write('Echo server\r\n')
	socket.pipe(socket)
})

// поднять tcp сервер
server.listen(configuration.log_server.http.port, error =>
{
	if (error)
	{
		return log.error(error)
	}

	log.info(`Log server is listening`)
})
