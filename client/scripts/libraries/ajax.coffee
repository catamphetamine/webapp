ajax = (url, data, options) ->
	resolver = Promise.pending()

	request = new XMLHttpRequest()

	# request.withCredentials = yes

	method = 'get'
	if options && options.method
		method = options.method

	if data && method == 'get'
		
		first = yes

		for key, value of data
			if first
				url += '?'
				first = no
			else
				url += '&'

			url += encodeURIComponent(key) + '=' + encodeURIComponent(value)

	request.open(method.toUpperCase(), url, yes)

	request.onload = (event) ->
		if @status != 200
			return resolver.reject(@status)

		response = @responseText

		if @getResponseHeader("Content-Type").starts_with('application/json')
			response = JSON.parse(response)

		resolver.resolve(response)

	request.onerror = (error) ->
		resolver.reject(error)

	request.ontimeout = ->
		resolver.reject('timeout')

	request.onabort = ->
		resolver.reject('abort')

	if data && method == 'post'
		parameters = JSON.stringify(data)

		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
		request.setRequestHeader("Content-length", parameters.length)
		request.send(parameters)
	else
		request.send()

	return resolver.promise

for method in ['get', 'post', 'head']
	do (method) ->
		ajax[method] = (url, data, options) ->
			options = options || {}
			options.method = method
			ajax(url, data, options)

module.exports = ajax