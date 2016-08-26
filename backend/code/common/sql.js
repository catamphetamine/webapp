import Knex from 'knex'
import knex_postgis_plugin from 'knex-postgis'
import Bookshelf from 'bookshelf'
import cascade_delete from 'bookshelf-cascade-delete'

export default class Sql
{
	constructor(model)
	{
		this.model = model
		this.collection = Sql.bookshelf().Collection.extend({ model })
	}

	// Finds a single record
	find(example, options)
	{
		if (!is_object(example))
		{
			return this.find({ id: example }, { require: true })
		}

		return new this.model(example).fetch(options).then(x => x !== null ? Sql.json(x) : null)
	}

	create(data)
	{
		return new this.model(data).save(null, { method: 'insert' })
	}

	update(where, data)
	{
		let model

		if (!is_object(where))
		{
			model = new this.model({ id: where })
		}
		else
		{
			model = this.model.where(where)
		}

		if (!data)
		{
			throw new Error(`No new properties supplied for SQL update`)
		}

		return model.save(data, { method: 'update', patch: true })
	}

	remove(id)
	{
		return new this.model({ id }).destroy()
	}
}

let knex_postgis
let bookshelf

Sql.bookshelf = () =>
{
	if (!bookshelf)
	{
		const knex = Knex(knexfile)

		knex_postgis = knex_postgis_plugin(knex)

		knex.postgisDefineExtras(function(knex, formatter)
		{
			const extras =
			{
				longitude_latitude(longitude, latitude)
				{
					return knex.raw('ST_SetSRID(ST_MakePoint(?, ?), 4326)', [longitude, latitude])
				}
			}

			return extras
		})

		bookshelf = Bookshelf(knex)
		bookshelf.plugin(cascade_delete)
	}

	return bookshelf
}

Sql.knex_postgis = () => knex_postgis

Sql.json = (model) =>
{
	return parse_dates(model.toJSON())
}

// JSON date deserializer.
//
// Automatically converts ISO serialized `Date`s
// in JSON responses for Ajax HTTP requests.
//
// Without it the developer would have to convert
// `Date` strings to `Date`s in Ajax HTTP responses manually.
//
// Use as the second, 'reviver' argument to `JSON.parse`: `JSON.parse(json, JSON.date_parser)`
//
// http://stackoverflow.com/questions/14488745/javascript-json-date-deserialization/23691273#23691273

// ISO 8601 date regular expression
const ISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/

// Walks JSON object tree
function parse_dates(object)
{
	// If an array is encountered, 
	// proceed recursively with each element of this array.
	if (object instanceof Array)
	{
		let i = 0
		while (i < object.length)
		{
			object[i] = parse_dates(object[i])
			i++
		}
	}
	// If a child JSON object is encountered,
	// convert all of its `Date` string values to `Date`s,
	// and proceed recursively for all of its properties.
	else if (is_object(object))
	{
		for (let key of Object.keys(object))
		{
			const value = object[key]
			if (typeof value === 'string' && ISO.test(value))
			{
				object[key] = new Date(value)
			}
			else
			{
				// proceed recursively
				parse_dates(value)
			}
		}
	}

	// Dates have been converted for this JSON object
	return object
}