Object.extend = (to, from, or_more) ->
	parameters = Array.prototype.slice.call(arguments, 0)
	if parameters.length > 2
		last = parameters.pop()
		intermediary_result = Object.extend.apply(@, parameters)
		return Object.extend(intermediary_result, last)

	for key, value of from
		if typeof from[key] == 'object' && to[key]?
			to[key] = Object.extend(to[key], from[key])
		else
			to[key] = from[key]

	return to

Object.merge = ->
	parameters = Array.prototype.slice.call(arguments, 0)
	parameters.unshift({})
	return Object.extend.apply(@, parameters)

global.merge = Object.merge


Object.clone = (object) -> JSON.parse(JSON.stringify(object))

Object.equals = (a, b) -> require('deep-equal')(a, b)

Object.get_value_at_path = (where, paths) ->

	paths = if paths instanceof Array
		paths.clone()
	else
		paths.split('.')

	get_value_at_path = (where, paths) ->

		return where if paths.is_empty()

		path = paths.shift()

		return if not where[path]?

		get_value_at_path(where[path], paths)

	get_value_at_path(where, paths)

Object.set_value_at_path = (where, paths, value) ->

	paths = if paths instanceof Array
		paths.clone()
	else
		paths.split('.')

	set_value_at_path = (where, paths, value) ->

		path = paths.shift()

		if paths.is_empty()
			return where[path] = value

		if typeof where[path] != 'object'
			where[path] = {}

		set_value_at_path(where[path], paths, value)

	set_value_at_path(where, paths, value)
	
# работает только для примитивов типа integer и string
Object.defineProperty Array.prototype, "intersect", {
	enumerable: no
	value: (array) ->
		a = this
		b = array

		result = []

		ai = 0
		bi = 0

		while ai < a.length && bi < b.length
			if a[ai] < b[bi]
				ai++
			else if a[ai] > b[bi]
				bi++
			else 
				# they're equal
				result.push(a[ai])
				ai++
				bi++

		return result
}

Object.defineProperty Array.prototype, "substract", {
	enumerable: no
	value: (array) ->
		@filter (item) -> array.indexOf(item) < 0
		# @filter (item) -> not array.some (same) -> item == same
}

Object.defineProperty Array.prototype, "remove", {
	enumerable: no
	value: (element) ->
		array = @

		test = (i) ->
			if typeof element == 'function'
				return element.bind(array[i])(array[i])
			else
				return array[i] == element

		i = 0
		while i < this.length
			if test(i)
				this.splice(i, 1)
				continue
			i++
}

Object.defineProperty Array.prototype, "remove_at", {
	enumerable: no
	value: (index) -> @splice(index, 1)
}

Object.defineProperty Array.prototype, "has", {
	enumerable: no
	value: (element) -> @indexOf(element) >= 0
}

Object.defineProperty Array.prototype, "not_empty", {
	enumerable: no
	value: -> @length > 0
}

Object.defineProperty Array.prototype, "is_empty", {
	enumerable: no
	value: -> @length == 0
}

Object.defineProperty Array.prototype, "clone", {
	enumerable: no
	value: -> @splice(0)
}

Array.prototype.last = ->
	return if @is_empty()
	return @[@length - 1]

String.prototype.starts_with = (substring) -> @indexOf(substring) == 0

String.prototype.ends_with = (substring) ->
	index = this.lastIndexOf(substring)
	return index >= 0 && index == this.length - substring.length

Object.set = ->
	parameters = Array.prototype.slice.call(arguments, 0)

	object = parameters.shift()
	value = parameters.pop()

	if not object
		throw new Error('Object is null')

	keys = parameters.reduce((reduced, value) ->
		reduced.concat(value.toString().split('.'))
	, 
	[])

	last_key = keys.pop()

	for key in keys
		if not object[key]
			object[key] = {}
		object = object[key]

	object[last_key] = value

	return object

Object.get = (object, path) ->
	parameters = Array.prototype.slice.call(arguments, 0)
	parameters.shift()

	path_elements = parameters.reduce((reduced, path_element) ->
		reduced.concat(path_element.toString().split('.'))
	,
	[])

	for key in path_elements
		return if not object
		object = object[key]

	return object

Object.equals = (a, b) -> angular.equals(a, b)

@format = (template, parameters) ->
	template.replace /\{([^\}]+)\}/g, (text, match) ->
		Object.get(parameters, match)

Function.prototype.delay = (time) ->
	setTimeout(@, time)

Function.prototype.periodical = (interval) ->
	action = @
	periodical = ->
		action()
		periodical.delay(interval)

	periodical()

# временная заглушка для переводов на языки
global._ = (key) -> key