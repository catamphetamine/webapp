import http from 'http'
import querystring from 'querystring'
import log from './../log'

const create_server = () =>
{
	const server = http.createServer((request, response) =>
	{
		console.log('Incoming Request')

		let data = ''

		request.on('data', (chunk) =>
		{
			data += chunk

			// Too much POST data, kill the connection!
			if (data.length > 1e6) 
			{
				request.connection.destroy()
			}
		})

		request.on('end', () =>
		{
			const posted = querystring.parse(data)

			console.log("JSON rpc request", posted)

			// обработать запрос, сделать ответ

			response.writeHead(200, { 'Content-Type': 'application/json' })
			response.end(JSON.stringify({ jsonrpc: '2.0', id: posted.id, method: posted.method, result: 123 }))
		})
	})

	server.listen(port)
}

const classes = {}

const errors = 
{
	PARSE_ERROR      : {code: -32700, message: 'Parse error'},
	INVALID_REQUEST  : {code: -32600, message: 'Invalid request'},
	METHOD_NOT_FOUND : {code: -32601, message: 'Method not found'},
	INVALID_PARAMS   : {code: -32602, message: 'Invalid parameters'},
	INTERNAL_ERROR   : {code: -32603, message: 'Internal error'},
	_ERROR           : {code: -32001, message: 'Error not found in RPC module'}
}

export default class json_rpc
{
	static add(name, the_class)
	{
		// es6 way (not babel)
		// const name = the_class.constructor.name
		classes[name] = the_class
	}

	static process(request)
	{
		return process(request)
	}

	static error(request)
	{
		const response = 
		{
			jsonrpc: '2.0',
			id: request.id,
			method: request.method,
			error: errors.INTERNAL_ERROR
		}

		return response
	}
}

async function process(request)
{
	if (!exists(request.id) || !exists(request.method) || !exists(request.params))
	{
		response.error = errors.INVALID_REQUEST
		return Promise.resolve(response)
	}

	const method = request.method

	const response = 
	{
		jsonrpc: '2.0',
		id: request.id,
		method: method
	}

	try
	{
		const module = method.substring(0, method.indexOf('.'))
		const module_method = method.substring(method.indexOf('.') + 1)

		if (!classes[module]) {
			response.error = errors.METHOD_NOT_FOUND
			return Promise.resolve(response)
		}

		if (!classes[module][module_method]) {
			response.error = errors.METHOD_NOT_FOUND
			return Promise.resolve(response)
		}

		const result = await classes[module][module_method](request.params)
		response.result = result
	}
	catch (error)
	{
		log.error(JSON.stringify(error))

		if (error.stack) 
		{
			log.error(error.stack)
		}
		else {
			log.error(error)
		}

		response.error = 
		{
			code: error.code || 0,
			message: error.message
		}
	}

	return response

	// return classes[module][module_method](request.params).then(result =>
	// {
	// 	response.result = result
	// 	return response
	// })
	// .catch(error =>
	// {
	// 	response.error = 
	// 	{
	// 		code: 0,
	// 		message: error.message
	// 	}
	// 	return response
	// })
}