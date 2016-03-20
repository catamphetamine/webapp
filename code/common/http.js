import superagent from 'superagent'

const http_methods =
{
	get    : 'get',
	post   : 'post',
	call   : 'post',
	create : 'post',
	put    : 'put',
	update : 'put',
	patch  : 'patch',
	delete : 'del'
}

const http_client = {}

for (let method of Object.keys(http_methods))
{
	http_client[method] = (destination, data, options) =>
	{
		const http_method = http_methods[method]

		if (!http_method)
		{
			throw new Error(`Api method not found: ${method}`)
		}

		const url = format_url(destination)

		return new Promise((resolve, reject) =>
		{
			const request = superagent[http_method](url)

			if (data)
			{
				if (http_method === 'post')
				{
					request.send(data)
				}
				else
				{
					request.query(data)
				}
			}

			if (options && options.headers)
			{
				for (let key of Object.keys(options.headers))
				{
					request.set(key, options.headers[key])
				}
			}

			if (options && options.locale)
			{
				request.set('accept-language', locale)
			}

			request.end((error, response) => 
			{
				if (!error && response)
				{
					error = response.error
				}

				if (error)
				{
					// superagent would have already output the error to console
					// console.error(error.stack)
					
					console.log('[http client] (http request error)')

					if (response)
					{
						error.code = response.status

						const content_type = response.get('content-type').split(';')[0].trim()

						if (content_type === 'text/plain')
						{
							error.message = response.text
						}
						else if (content_type === 'text/html')
						{
							error.html = response.text
						}
					}

					return reject(error)
				}

				resolve(response.body)
			})
		})
	}
}

function format_url(destination)
{
	if (is_object(destination))
	{
		// Prepend host and port of the API server to the path.
		return `http://${destination.host}:${destination.port}${destination.path}`
	}

	// Prepend prefix to relative URL, to proxy to API server.
	return destination
}

export default http_client

// import http        from 'http'
// import querystring from 'querystring'

// Promise.promisifyAll(http)

// export function get(options)
// {
// 	return new Promise((resolve, reject) =>
// 	{
// 		const http_request = http.request
// 		({
// 			host: configuration.authentication_service.http.host,
// 			port: configuration.authentication_service.http.port,
// 			path: options.parameters ? `${options.path}?${querystring.stringify(options.parameters)}` : options.path
// 		},
// 		response =>
// 		{
// 			let response_data = ''

// 			response.setEncoding('utf8')

// 			if ()

// 			response.on('data', chunk =>
// 			{
// 				response_data += chunk
// 			})

// 			response.on('end', () =>
// 			{
// 				resolve(response)
// 			})
// 		})

// 		http_request.on('error', error => reject(error))

// 		// // write data to request body
// 		// http_request.write(postData)

// 		http_request.end()
// 	})
// }