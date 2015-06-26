import deep_equal from 'deep-equal'

const exists = what => typeof what !== 'undefined'

Object.extend = function(to, from, or_more)
{
	const parameters = Array.prototype.slice.call(arguments, 0)

	if (exists(or_more))
	{
		const last = parameters.pop()
		const intermediary_result = Object.extend.apply(this, parameters)
		return Object.extend(intermediary_result, last)
	}

	for (let key of Object.keys(from))
	{
		if (typeof from[key] === 'object' && exists(to[key]))
		{
			to[key] = Object.extend(to[key], from[key])
		}
		else
		{
			to[key] = from[key]
		}
	}

	return to
}

Object.merge = function()
{
	const parameters = Array.prototype.slice.call(arguments, 0)
	parameters.unshift({})
	return Object.extend.apply(this, parameters)
}

global.merge = Object.merge

Object.clone = object => JSON.parse(JSON.stringify(object))

Object.equals = (a, b) => deep_equal(a, b)

Object.get_value_at_path = (where, paths) =>
{
	paths = paths instanceof Array ? paths.clone() : paths.split('.')

	const get_value_at_path = (where, paths) =>
	{
		if (paths.is_empty())
		{
			return where
		}

		const path = paths.shift()

		if (!exists(where[path]))
		{
			return
		}

		return get_value_at_path(where[path], paths)
	}

	return get_value_at_path(where, paths)
}

Object.set_value_at_path = (where, paths, value) =>
{
	paths = paths instanceof Array ? paths.clone() : paths.split('.')

	const set_value_at_path = (where, paths, value) =>
	{
		const path = paths.shift()

		if (paths.is_empty())
		{
			return where[path] = value
		}

		if (typeof where[path] != 'object')
		{
			where[path] = {}
		}

		return set_value_at_path(where[path], paths, value)
	}

	return set_value_at_path(where, paths, value)
}

// работает только для примитивов типа integer и string
// Object.defineProperty Array.prototype, "intersect", {
// 	enumerable: false
// 	value: (array) ->
// 		a = this
// 		b = array

// 		result = []

// 		ai = 0
// 		bi = 0

// 		while ai < a.length && bi < b.length
// 			if a[ai] < b[bi]
// 				ai++
// 			else if a[ai] > b[bi]
// 				bi++
// 			else 
// 				# they're equal
// 				result.push(a[ai])
// 				ai++
// 				bi++

// 		return result
// }

// Object.defineProperty Array.prototype, "substract", {
// 	enumerable: false
// 	value: (array) ->
// 		@filter (item) -> array.indexOf(item) < 0
// 		# @filter (item) -> not array.some (same) -> item == same
// }

// Object.defineProperty Array.prototype, "remove", {
// 	enumerable: false
// 	value: (element) ->
// 		array = @

// 		test = (i) ->
// 			if typeof element == 'function'
// 				return element.bind(array[i])(array[i])
// 			else
// 				return array[i] == element

// 		i = 0
// 		while i < this.length
// 			if test(i)
// 				this.splice(i, 1)
// 				continue
// 			i++
// }

// Object.defineProperty Array.prototype, "remove_at", {
// 	enumerable: false
// 	value: (index) -> @splice(index, 1)
// }

Object.defineProperty(Array.prototype, "has",
{
	enumerable: false,
	value: function(element) 
	{ 
		return this.indexOf(element) >= 0
	}
})

Object.defineProperty(Array.prototype, "not_empty", 
{
	enumerable: false,
	value: function() 
	{ 
		return this.length > 0
	}
})

Object.defineProperty(Array.prototype, "is_empty", 
{
	enumerable: false,
	value: function() 
	{ 
		return this.length == 0 
	}
})

Object.defineProperty(Array.prototype, "clone", 
{
	enumerable: false,
	value: function() 
	{ 
		return this.splice(0)
	}
})

Object.defineProperty(Array.prototype, 'last', 
{
	enumerable: false,
	value: function()
	{
		if (this.is_empty()) {
			return
		}
		return this[this.length - 1]
	}
})

// String.prototype.starts_with = (substring) -> @indexOf(substring) == 0

// String.prototype.ends_with = (substring) ->
// 	index = this.lastIndexOf(substring)
// 	return index >= 0 && index == this.length - substring.length

// Object.set = ->
// 	parameters = Array.prototype.slice.call(arguments, 0)

// 	object = parameters.shift()
// 	value = parameters.pop()

// 	if not object
// 		throw new Error('Object is null')

// 	reducer = (reduced, value) ->
// 		reduced.concat(value.toString().split('.'))

// 	keys = parameters.reduce(reducer, [])

// 	last_key = keys.pop()

// 	for key in keys
// 		if not object[key]
// 			object[key] = {}
// 		object = object[key]

// 	object[last_key] = value

// 	return object

// Object.get = (object, path) ->
// 	parameters = Array.prototype.slice.call(arguments, 0)
// 	parameters.shift()

// 	reducer = (reduced, path_element) ->
// 		reduced.concat(path_element.toString().split('.'))

// 	path_elements = parameters.reduce(reducer, [])

// 	for key in path_elements
// 		return if not object
// 		object = object[key]

// 	return object

// Object.equals = (a, b) -> angular.equals(a, b)

// this.format = (template, parameters) =>
// {
// 	return template.replace(/\{([^\}]+)\}/g, (text, match) =>
// 	{
// 		Object.get(parameters, match)
// 	})
// }

// Object.defineProperty(Function.prototype, 'delay', 
// {
// 	enumerable: false,
// 	value: time => setTimeout(this, time)
// })

Object.defineProperty(Function.prototype, 'periodical', 
{
	enumerable: false,
	value: function (interval)
	{
		const action = this
		const periodical = () =>
		{
			action()
			periodical.delay(interval)
		}

		periodical()
	}
})

// временная заглушка для переводов на языки
// global._ = (key) -> key