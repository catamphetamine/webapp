const email_max_length = 254 // in bytes
const alias_max_length = 32
const ip_address_max_length = 3 * 4 + 3
const uuid_length = 32 + 4 // Section 3 of RFC4122 provides the formal definition of UUID string representations. It's 36 characters - 32 hex digits + 4 dashes.

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

		table.string('alias', alias_max_length).unique()

		table.string('place', 128)

		// currently using 2-digit codes, but for being future proof
		// https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3
		table.string('country', 3)

		table.string('role', 256)
		table.string('locale', 128)

		table.jsonb('picture_sizes')

		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
		table.timestamp('was_online_at')

		table.timestamp('blocked_at')
		table.text('blocked_reason')
		table.bigint('blocked_by').references('users.id')

		// Find user by alias for aliased URLs
		table.index('alias')

		// Find user by email on sign in (and register)
		table.index('email')
	})

	.createTable('user_alias_history', function(table)
	{
		table.bigIncrements('id').primary().unsigned()

		table.bigint('user').notNullable().references('users.id').onDelete('CASCADE')
		table.string('alias', alias_max_length)

		table.unique(['user', 'alias'])

		// Find user by alias for aliased URLs
		table.index(['user', 'alias'])
	})

	.createTable('block_user_tokens', function(table)
	{
		// "block_user_tokens_uuid" constraint name
		// is be used in user-service sql store
		// to hande duplicate UUIDs (which is still extremely unlikely).
		table.string('id', uuid_length).primary('block_user_tokens_uuid')

		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
		table.boolean('self').notNullable().defaultTo(false)
		table.bigint('user').notNullable().references('users.id').onDelete('CASCADE')
	})

	.createTable('authentication', function(table)
	{
		table.bigIncrements('id').primary().unsigned()
		table.string('type', 32).notNullable()
		table.text('value').notNullable()
		table.bigint('user').notNullable().references('users.id').onDelete('CASCADE')
		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
		table.integer('attempts_left')
		table.timestamp('expires')
	})

	.createTable('multifactor_authentication', function(table)
	{
		// "multifactor_authentication_uuid" constraint name
		// could be used in user-service sql store
		// to hande duplicate UUIDs (which is extremely unlikely).
		table.string('id', uuid_length).primary('multifactor_authentication_uuid')
		table.bigint('user').notNullable().unique().references('users.id').onDelete('CASCADE')
		table.string('purpose').notNullable()
		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
		table.timestamp('latest_attempt')
		table.timestamp('expires')
		table.float('temperature').notNullable().defaultTo(0)
		table.integer('attempts').notNullable().defaultTo(0)
		table.text('pending')
	})

	.createTable('authentication_tokens', function(table)
	{
		table.bigIncrements('id').primary().unsigned()

		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
		table.timestamp('revoked_at')

		table.bigint('user').notNullable().references('users.id').onDelete('CASCADE')
	})

	.createTable('authentication_token_access_history', function(table)
	{
		table.bigIncrements('id').primary().unsigned()

		table.timestamp('updated_at').notNullable()
		table.string('ip', ip_address_max_length).notNullable()

		table.jsonb('place')

		table.bigint('token').notNullable().references('authentication_tokens.id').onDelete('CASCADE')

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

	.table('users', function(table)
	{
		table.bigint('picture').references('images.id')
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