import deep_equal from 'deep-equal'

const exists = what => typeof what !== 'undefined'
global.exists = exists

const no = function()
{
	const parameters = Array.prototype.slice.call(arguments, 0)
	return !exists.apply(this, parameters)
}
global.no = no

// extends the first object with all the others
Object.extend = function(...objects)
{
	const to   = objects[0]
	const from = objects[1]

	if (objects.length > 2)
	{
		const last = objects.pop()
		const intermediary_result = Object.extend.apply(this, objects)
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

global.extend = Object.extend

Object.merge = function()
{
	const parameters = Array.prototype.slice.call(arguments, 0)
	parameters.unshift({})
	return Object.extend.apply(this, parameters)
}

global.merge = Object.merge

Object.clone = function(object)
{
	return Object.merge({}, object)
}

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

Object.defineProperty(Array.prototype, 'first',
{
	enumerable: false,
	value: function() 
	{ 
		return this[0]
	}
})

Object.defineProperty(Array.prototype, 'has',
{
	enumerable: false,
	value: function(element) 
	{ 
		return this.indexOf(element) >= 0
	}
})

Object.defineProperty(Array.prototype, 'not_empty', 
{
	enumerable: false,
	value: function() 
	{ 
		return this.length > 0
	}
})

Object.defineProperty(Array.prototype, 'is_empty', 
{
	enumerable: false,
	value: function() 
	{ 
		return this.length == 0 
	}
})

Object.defineProperty(Array.prototype, 'clone', 
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

Object.defineProperty(Array.prototype, 'remove', 
{
	enumerable: false,
	value: function(element)
	{
		const index = this.indexOf(element)
		if (index >= 0)
		{
			array.splice(index, 1)
		}
		return this
	}
})

Object.defineProperty(String.prototype, 'starts_with', 
{
	enumerable: false,
	value: function(substring)
	{
		return this.indexOf(substring) === 0
	}
})

Object.defineProperty(String.prototype, 'ends_with', 
{
	enumerable: false,
	value: function(substring)
	{
		const index = this.lastIndexOf(substring)
		return index >= 0 && index === this.length - substring.length
	}
})

RegExp.escape = function(string)
{
	const specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", 'g')
	return string.replace(specials, "\\$&")
}

Object.defineProperty(String.prototype, 'replace_all', 
{
	enumerable: false,
	value: function(what, with_what)
	{
		const regexp = new RegExp(RegExp.escape(what), 'g')
		return this.replace(regexp, with_what)
	}
})

Object.defineProperty(String.prototype, 'has', 
{
	enumerable: false,
	value: function(what)
	{
		return this.indexOf(what) >= 0
	}
})

Object.defineProperty(String.prototype, 'before', 
{
	enumerable: false,
	value: function(what)
	{
		const index = this.indexOf(what)
		if (index < 0)
		{
			return this
		}
		return this.substring(0, index)
	}
})

Object.defineProperty(String.prototype, 'after', 
{
	enumerable: false,
	value: function(what)
	{
		const index = this.indexOf(what)
		if (index < 0)
		{
			return ''
		}
		return this.substring(index + what.length)
	}
})

Object.defineProperty(String.prototype, 'is_blank', 
{
	enumerable: false,
	value: function()
	{
		return !this || /^\s*$/.test(this)
	}
})

Object.defineProperty(String.prototype, 'repeat', 
{
	enumerable: false,
	value: function(times)
	{
		let result = ''
		while (times > 0)
		{
			result += this
			times--
		}
		return result
	}
})

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

global.custom_error = function(name)
{
	class Custom_error extends Error
	{
		constructor(error)
		{
			super()

			if (exists(error))
			{
				if (exists(error.code))
				{
					this.code = error.code
				}
				this.message = error.message || error
			}

			this.name = name

			if (Error.captureStackTrace)
			{
				Error.captureStackTrace(this, Custom_error)
			}
		}
	}

	Custom_error.is_custom_error = true

	return Custom_error
}