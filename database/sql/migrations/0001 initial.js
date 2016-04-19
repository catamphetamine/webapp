const id_length = 24 // in bytes
const UUID_length = 16 // in bytes
const email_max_length = 254 // in bytes

exports.up = function(knex, Promise)
{
	return knex.schema.createTable('users', function(table)
	{
		// table.bigIncrements('id').primary().unsigned()
		table.string('id', id_length).primary()

		table.text('name').notNullable().unique()
		table.string('email', email_max_length).notNullable().unique()

		table.string('city', 128)

		// currently using 2-digit codes, but for being future proof
		// https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3
		table.string('country', 3)

		table.string('role', 256)
		table.string('locale', 128)

		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
	})
	.createTable('messages', function(table)
	{
		table.bigIncrements('id').primary().unsigned()

		table.text('text').notNullable()
		table.boolean('read').notNullable().defaultTo(false)

		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())

		table.string('from', id_length).references('users.id')
		table.string('to',   id_length).references('users.id')
	})
}

exports.down = function(knex, Promise)
{
	return knex.schema.dropTable('messages')
		.dropTable('users')
}