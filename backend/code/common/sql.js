import Knex from 'knex'
import knex_postgis_plugin from 'knex-postgis'

export default class Sql
{
	constructor(table)
	{
		this.table = table
	}

	// Finds a single record
	async find(example, options)
	{
		if (!is_object(example))
		{
			return this.find({ id: example }) // , { require: true })
		}

		const result = await knex.select('*')
			.from(this.table)
			.where(example)
			.limit(1)
			.map(Sql.json)

		if (result.length === 0)
		{
			return null
		}

		return result[0]
	}

	// Finds matching records
	find_all(example)
	{
		return knex.select('*')
			.from(this.table)
			.where(example)
			.map(Sql.json)
	}

	async count(example)
	{
		return parseInt(await knex(this.table).count(example))
	}

	async create(data, options = {})
	{
		const ids = await knex.insert(data).into(this.table).returning(options.id || 'id')

		return ids[0]
	}

	async update(where, data)
	{
		if (!is_object(where))
		{
			where = { id: where }
		}

		if (!data)
		{
			throw new Error(`No properties supplied for SQL update`)
		}

		const count = await knex(this.table).where(where).update(data)

		return count > 0
	}

	remove(id)
	{
		if (!id)
		{
			throw new Error(`"id" not supplied for SQL .remove()`)
		}

		return knex(this.table).where({ id }).del()
	}
}

const knex = Knex(knexfile)
const knex_postgis = knex_postgis_plugin(knex)

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

Sql.knex_postgis = () => knex_postgis

Sql.json = (model) =>
{
	return parse_dates(model)
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