import Knex from 'knex'
import knex_postgis_plugin from 'knex-postgis'

export default class Sql
{
	constructor(table, model)
	{
		this.id = 'id'
		this.table = table
		this.model = model
	}

	// Finds a single record by example object (or id)
	async find(example, options)
	{
		if (!is_object(example))
		{
			return this.find({ [this.id]: example })
		}

		const result = await knex.select('*')
			.from(this.table)
			.where(example)
			.limit(1)
			.map(Sql.json)

		if (result.length === 0)
		{
			return undefined
		}

		return result[0]
	}

	// Finds matching records
	async find_all(example, options = {})
	{
		// Complex fetch: preload relations (dependencies)
		if (options.including)
		{
			// Validate `including`
			for (let relation of options.including)
			{
				if (!this.model)
				{
					throw new Error('`model` not supplied for this SQL helper')
				}

				if (!this.model[relation])
				{
					throw new Error(`Unknown relation "${relation}"`)
				}
			}

			// Construct the select part of the query.
			// Using JOINs for preloading relations (dependencies)
			// https://github.com/tgriesser/knex/issues/61#issuecomment-259252127

			// SELECT to_json(a.*) as a, to_json(b.*) as b
			let query = knex.select([knex.raw(`to_json(${this.table}.*) as ${this.table}`)].concat(options.including.map(relation =>
			{
				return knex.raw(`to_json(${this.model[relation].sql.table}.*) as ${relation}`)
			})))
			// ... FROM x
			.from(this.table)

			// Use left outer join for the first join
			// to not loose the main entity
			// in case all its dependencies are `null`
			let join = 'leftOuterJoin'

			for (let relation of options.including)
			{
				const backreference = this.model[relation].key

				// ... LEFT OUTER JOIN a ON a.key = x.id
				query = query[join]
				(
					this.model[relation].sql.table,
					`${this.model[relation].sql.table}.${backreference ? this.model[relation].key : this.model[relation].sql.id}`,
					`${this.table}.${backreference ? this.id : relation}`
				)

				// Use inner join for all subsequent joins
				if (join === 'leftOuterJoin')
				{
					join = 'join'
				}
			}

			// ... WHERE example
			const results = await query.where(example).map(Sql.json)

			// Now we have an array of flattened results
			// (containing duplicates all over it),
			// so the results must be unflattened
			// back to a structure.

			// The results list
			const entities_array = []

			// Already encountered main entity register
			const entities_by_id = {}

			for (let result of results)
			{
				// The main entity
				const entity = result[this.table]

				// If this main entity hasn't been
				// encountered before, then mark it
				// as an "encountered" one.
				let entity_by_id = entities_by_id[entity.id]
				if (!entity_by_id)
				{
					entity_by_id = entity
					// Register this entity as an "encountered" one
					entities_by_id[entity.id] = entity_by_id
					// Add this main entity to the results list
					entities_array.push(entity_by_id)
				}

				// Fill in the main entity's relations (dependencies)
				for (let key of Object.keys(result))
				{
					// Skip oneself
					if (key === this.table)
					{
						continue
					}

					// If this relation is an array
					// (one-to-many)
					if (this.model[key].many)
					{
						// If there's no array property for this relation,
						// then create it.
						if (!entity_by_id[key])
						{
							entity_by_id[key] = []
						}

						// If a related entity exists,
						// add it to the array property.
						if (result[key])
						{
							// In case of multiple one-to-many relations
							// this code should check for the same "id" existence
							// before adding to the array
							// to avoid duplicates.
							const related_entity = result[key]
							const added_entities = entity_by_id[key]
							const related_entity_primary_key = this.model[key].sql.id
							const already_added = added_entities.filter(_ => _[related_entity_primary_key] === related_entity[related_entity_primary_key]).length > 0
							if (!already_added)
							{
								added_entities.push(related_entity)
							}
						}
					}
					// If this relation is simple
					// (one-to-one)
					else
					{
						// `knex` returns `null` for `nothing`
						entity_by_id[key] = result[key] === null ? undefined : result[key]
					}
				}
			}

			// Return the results list
			return entities_array
		}

		// Simple fetch
		return await knex.select('*')
			.from(this.table)
			.where(example)
			.map(Sql.json)
	}

	// Counts matching entries in the database.
	async count(example)
	{
		let query = knex(this.table)

		if (example)
		{
			query = query.where(example)
		}

		const count = (await query.count())[0].count
		return parseInt(count)
	}

	// Creates an entry in the database.
	// Returns the ID of the created entry.
	async create(data)
	{
		const ids = await knex.insert(data).into(this.table).returning(this.id)

		return ids[0]
	}

	// Updates an entry in the database.
	async update(where, data)
	{
		if (!data)
		{
			// Not using `is_object` here due to `node-postgres`
			// queried objects being non-objects.
			// https://github.com/brianc/node-postgres/issues/1131
			if (where && where[this.id])
			{
				data = {}

				for (const key of Object.keys(where))
				{
					if (key !== this.id)
					{
						data[key] = where[key]
					}
				}

				where = where[this.id]
			}
			else
			{
				throw new Error(`No properties supplied for SQL update`)
			}
		}

		if (!is_object(where))
		{
			where = { [this.id]: where }
		}

		const count = await knex(this.table).where(where).update(data)

		return count > 0
	}

	delete(where)
	{
		if (!is_object(where))
		{
			where = { [this.id]: where }
		}

		if (!where)
		{
			throw new Error(`No argument supplied for SQL .delete()`)
		}

		return knex(this.table).where(where).del()
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
	// Not using this one-liner because of
	// the `anonymous` constructor issue
	// https://github.com/tgriesser/knex/issues/1774
	// return parse_dates(model)

	for (let key of Object.keys(model))
	{
		model[key] = parse_dates(model[key])
	}

	return model
}

Sql.has_many = (to_sql, key) =>
({
	sql: to_sql,
	key,
	many: true
})

Sql.belong_to = (to_sql, key) =>
({
	sql: to_sql
})

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
// http://stackoverflow.com/a/14322189/970769
const ISO = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/

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