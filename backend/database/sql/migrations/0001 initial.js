const email_max_length = 254 // in bytes
const username_max_length = 32
const ip_address_max_length = 3 * 4 + 3

exports.up = function(knex, Promise)
{
	return knex.schema

	// // PostGIS must be installed.
	// // Allows for handling geospacial data in PostgreSQL.
	// // (this command won't work as it requires superuser privileges)
	// .raw('CREATE EXTENSION postgis')

	// // Random UUID generator for PostgreSQL
	// // http://www.starkandwayne.com/blog/uuid-primary-keys-in-postgresql/
	// // https://www.clever-cloud.com/blog/engineering/2015/05/20/why-auto-increment-is-a-terrible-idea/
	// .raw('CREATE EXTENSION pgcrypto')
	//
	// table.uuid('id').primary().defaultTo('gen_random_uuid()')

	.createTable('users', function(table)
	{
		table.bigIncrements('id').primary().unsigned()

		table.text('name').notNullable()
		table.string('email', email_max_length).notNullable().unique()
		
		table.string('username', username_max_length).unique()

		table.string('place', 128)

		// currently using 2-digit codes, but for being future proof
		// https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3
		table.string('country', 3)

		table.string('role', 256)
		table.string('locale', 128)

		table.bigint('picture').references('images.id')
		table.jsonb('picture_sizes')

		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
		table.timestamp('was_online_at')

		// Find user by username for username URLs
		table.index('username')

		// Find user by email on sign in (and register)
		table.index('email')
	})

	.createTable('authentication_data', function(table)
	{
		table.bigIncrements('id').primary().unsigned()

		table.text('password').notNullable()

		table.timestamp('login_attempt_failed_at')
		table.integer('login_attempt_temperature')

		table.bigint('user').notNullable().unique().references('users.id')
	})

	.createTable('authentication_tokens', function(table)
	{
		table.bigIncrements('id').primary().unsigned()

		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
		table.timestamp('revoked_at')

		table.bigint('user').notNullable().references('users.id')
	})

	.createTable('authentication_token_access_history', function(table)
	{
		table.bigIncrements('id').primary().unsigned()

		table.timestamp('updated_at').notNullable()
		table.string('ip', ip_address_max_length).notNullable()

		table.jsonb('place')

		table.bigint('token').notNullable().references('authentication_tokens.id')

		// "authentication_token_access_history_token_ip_unique" constraint name
		// is used in authentication sql store.
		table.unique(['token', 'ip'], 'authentication_token_access_history_token_ip_unique')
	})

	.createTable('images', function(table)
	{
		table.bigIncrements('id').primary().unsigned()

		table.text('type').notNullable()
		table.bigint('files_size').notNullable()
		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())

		table.timestamp('taken_at_utc0')
		table.timestamp('taken_at')

		table.jsonb('sizes').notNullable()
		table.jsonb('info')

		table.bigint('user').notNullable().references('users.id')
	})

	// Add `coordinates` column
	.raw(`ALTER TABLE images ADD COLUMN coordinates GEOMETRY(Point, 4326)`)

	.createTable('messages', function(table)
	{
		table.bigIncrements('id').primary().unsigned()

		table.text('text').notNullable()
		table.boolean('read').notNullable().defaultTo(false)

		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())

		table.bigint('from').notNullable().references('users.id')
		table.bigint('to'  ).notNullable().references('users.id')
	})
}

exports.down = function(knex, Promise)
{
	return knex.schema.dropTable('messages')
		.dropTable('authentication_tokens')
		.dropTable('users')
}