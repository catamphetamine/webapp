import Knex from 'knex'
import knex_postgis_plugin from 'knex-postgis'

export default class Sql
{
	constructor(table, model = {})
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
			// Construct the select part of the query.
			// Using JOINs for preloading relations (dependencies)
			// https://github.com/tgriesser/knex/issues/61#issuecomment-259252127

			const joined_tables = collect_joined_tables_info(this, options.including)

			// SELECT to_json(x.*) as x, to_json(relation.*) as relation, ...
			let query = knex.select([knex.raw(`to_json("${this.table}".*) as "${this.table}"`)].concat(joined_tables.map(({ name }) =>
			{
				return knex.raw(`to_json("${name}".*) as "${name}"`)
			})))
			// ... FROM x ...
			.from(this.table)

			const where = { ...example }

			for (const joined_table of joined_tables)
			{
				// A custom join `backreference` may be set up for a `relation`
				// meaning that the `x` table either doesn't hold
				// reference to the `relation` row id
				// or is associated with many `relation` rows
				// and therefore the link is stored in the `relation` table.

				// "... LEFT OUTER JOIN relation ON x.id = relation.key" (backreference)
				// or
				// "... LEFT OUTER JOIN relation ON x.relation = relation.id" (usual)
				query = query.leftOuterJoin
				(
					// LEFT OUTER JOIN relation
					`${joined_table.table} as ${joined_table.name}`,
					// " ON x.id" or " ON x.relation"
					`${joined_table.parent}.${joined_table.parent_key}`,
					// " = relation.x" or " = relation.id"
					`${joined_table.name}.${joined_table.key}`
				)

				if (joined_table.where)
				{
					where[joined_table.where[0]] = joined_table.where[1]
				}
			}

			// ... WHERE {example}
			const results = await query.where(where).map(Sql.json)

			// Now we have an array of flattened results
			// (containing duplicates all over it),
			// so the results must be unflattened
			// back to a structure.

			// A `result` is a JSON object with each key
			// representing a corresponding joined table row
			// (which is a JSON object too).

			const entities = get_entities(results, this.table)

			for (const entity of entities)
			{
				const rows = results.filter(row => row[this.table].id === entity.id)
				expand_relations(entity, this.model, options.including, rows, this.table)
			}

			// Return the results list
			return entities
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

Sql.many = (sql, join_table, self_id_column, relation_id_column) =>
{
	const result =
	{
		sql,
		many: true
	}

	if (!self_id_column)
	{
		result.backreference = join_table
	}
	else
	{
		result.join_table = join_table
		result.self_id_column = self_id_column
		result.relation_id_column = relation_id_column
	}

	return result
}

Sql.one = (sql, backreference) =>
({
	sql,
	backreference
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

function expand_relations(entity, model, including, rows, table_name, prefix = '')
{
	for (let include of including)
	{
		include = normalize_include(include)
		const relation = include.name

		if (!model[relation])
		{
			throw new Error(`Relation "${relation}" not found in model of "${table_name}"`)
		}

		// If this relation is an array
		// ("one-to-many", "many-to-many")
		if (model[relation].many)
		{
			const related_entities = get_entities(rows, relation)

			for (const related_entity of related_entities)
			{
				expand_relation(related_entity, relation, rows, include, prefix)
			}

			entity[relation] = related_entities
		}
		// If this relation is a single
		// ("one-to-one")
		else
		{
			let related_entity = rows[0][relation]

			// // `knex` returns `null` for `nothing`
			// if (related_entity === null)
			// {
			// 	related_entity = undefined
			// }

			if (related_entity)
			{
				expand_relation(related_entity, relation, rows, include, prefix)
			}

			entity[relation] = related_entity
		}
	}

	return entity
}

function expand_relation(related_entity, relation, rows, including_relation, prefix)
{
	if (!including_relation.including)
	{
		return related_entity
	}

	const related_entity_rows = rows.filter(row => row[relation] && row[relation].id === related_entity.id)
	return expand_relations(related_entity, model[relation].sql.model, including_relation.including, related_entity_rows, `${prefix}${relation}`, `${prefix}${relation}.`)
}

function get_entities(rows, name)
{
	const entities = []

	let id
	for (const row of rows)
	{
		const entity = row[name]

		if (!entity)
		{
			continue
		}

		if (entity.id === id)
		{
			continue
		}

		id = entity.id
		entities.push(entity)
	}

	return entities
}

function normalize_include(include)
{
	if (typeof include === 'string')
	{
		include =
		{
			name: include
		}
	}

	return include
}

function collect_joined_tables_info(sql, including, parent_table = undefined, prefix = '', joined_tables = [])
{
	for (let include of including)
	{
		include = normalize_include(include)
		const relation = include.name

		if (!sql.model[relation])
		{
			throw new Error(`Relation "${relation}" not found in model of "${sql.table}"`)
		}

		const relation_model = sql.model[relation]
		const relation_sql = relation_model.sql

		joined_tables.push
		({
			table  : relation_sql.table,
			name   : `${prefix}${relation}`,
			key    : relation_model.backreference || relation_sql.id,
			parent : parent_table || sql.table,
			parent_key : relation_model.backreference ? sql.id : relation,
			where  : include.where
		})

		if (include.including)
		{
			collect_joined_tables_info(relation_sql, include.including, `${prefix}${relation}`, `${prefix}${relation}.`, joined_tables)
		}
	}

	return joined_tables
}