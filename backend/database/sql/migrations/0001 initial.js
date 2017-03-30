const string_max_length = 255 // in bytes
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

		table.string('email', email_max_length).notNullable().unique()

		table.string('role', 256)
		table.string('locale', 128)

		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
		table.timestamp('was_online_at')

		table.timestamp('blocked_at')
		table.text('blocked_reason')
		table.bigint('blocked_by').references('users.id')

		// Find user by email on sign in (and register)
		table.index('email')
	})

	.createTable('posters', function(table)
	{
		table.bigIncrements('id').primary().unsigned()

		table.string('name', string_max_length).notNullable()
		table.string('alias', alias_max_length).unique()

		table.text('description')

		table.string('place', 128)

		// currently using 2-digit codes, but for being future proof
		// https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3
		table.string('country', 3)

		table.jsonb('palette').notNullable().defaultTo({})

		table.string('type')

		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())

		// JSON array (NULL by default)
		table.jsonb('blacklist')

		table.timestamp('blocked_at')
		table.text('blocked_reason')
		table.bigint('blocked_by').references('users.id')

		table.bigint('introduction').references('posts.id')

		table.bigint('user').unique().references('users.id')
	})

	.createTable('poster_users', function(table)
	{
		table.primary(['poster', 'user'])

		table.bigint('poster').notNullable().references('posters.id').onDelete('CASCADE')
		table.bigint('user').notNullable().references('users.id').onDelete('CASCADE')
	})

	.createTable('poster_alias_history', function(table)
	{
		table.bigIncrements('id').primary().unsigned()

		table.bigint('poster').notNullable().references('posters.id').onDelete('CASCADE')
		table.string('alias', alias_max_length)

		table.unique(['poster', 'alias'])

		// Find user by alias for aliased URLs
		table.index(['poster', 'alias'])
	})

	.createTable('block_poster_tokens', function(table)
	{
		// "block_poster_tokens_uuid" constraint name
		// is be used in user-service sql store
		// to hande duplicate UUIDs (which is still extremely unlikely).
		table.string('id', uuid_length).primary('block_poster_tokens_uuid')

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
		table.string('action').notNullable()
		table.jsonb('extra')
		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
		table.timestamp('latest_attempt')
		table.timestamp('expires')
		table.float('temperature').notNullable().defaultTo(0)
		table.integer('attempts').notNullable().defaultTo(0)
		table.jsonb('pending')

		table.unique(['user', 'action'])
	})

	.createTable('access_tokens', function(table)
	{
		table.bigIncrements('id').primary().unsigned()

		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
		table.timestamp('revoked_at')

		table.bigint('user').notNullable().references('users.id').onDelete('CASCADE')
	})

	.createTable('access_token_history', function(table)
	{
		table.bigIncrements('id').primary().unsigned()

		table.timestamp('updated_at').notNullable()
		table.string('ip', ip_address_max_length).notNullable()

		table.jsonb('place')

		table.bigint('token').notNullable().references('access_tokens.id').onDelete('CASCADE')

		// "access_token_history_token_ip_unique" constraint name
		// is used in authentication sql store.
		table.unique(['token', 'ip'], 'access_token_history_token_ip_unique')
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

	.table('posters', function(table)
	{
		// Storing pictures as JSONs is a minor optimization
		// since they aren't "edited" ever.
		table.jsonb('picture')
		table.jsonb('background_pattern')
		table.jsonb('banner')

		// table.bigint('picture').references('images.id')
		// table.bigint('background_pattern').references('images.id')
	})

	.createTable('streams', function(table)
	{
		table.bigIncrements('id').primary().unsigned()

		table.string('type')

		// // For faster conversation list querying
		// table.bigint('latest_post').references('posts.id')

		// Allowed posters (NULL for public streams)
		table.jsonb('posters')
	})

	// Poster's "wall" (e.g. "blog")
	.table('posters', function(table)
	{
		table.bigint('stream').notNullable().references('streams.id')
	})

	// For new posts notifications
	.createTable('stream_posters', function(table)
	{
		table.primary(['stream', 'poster'])

		table.bigint('stream').notNullable().references('streams.id')
		table.bigint('poster').notNullable().references('posters.id')

		// For faster notification creation
		table.bigint('user').references('users.id')
	})

	.createTable('notifications', function(table)
	{
		table.bigIncrements('id').primary().unsigned()

		table.bigint('user').notNullable().references('users.id').onDelete('CASCADE')
		table.string('type').notNullable()
	})

	.createTable('posts', function(table)
	{
		table.bigIncrements('id').primary().unsigned()

		table.text('content')
		table.jsonb('attachments')

		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
		table.timestamp('edited_at')

		table.bigint('poster').notNullable().references('posters.id')
		table.bigint('stream').notNullable().references('streams.id')

		// For showing the most "interesting" posts
		// and hiding the least "interesting" ones.
		table.int('upvotes').notNullable.defaultTo(0)
		table.int('downvotes').notNullable.defaultTo(0)

		table.boolean('hidden').notNullable().defaultTo(false)

		// Parent post (for comments)
		table.bigint('post').references('posts.id')
	})

	// Same as `posts` but splitting them into different tables
	// because there will be magnitudes more messages than posts,
	// and also messages are equally written and read
	// while posts are written one time and are then read extensively.
	.createTable('messages', function(table)
	{
		table.bigIncrements('id').primary().unsigned()

		table.text('content')
		table.jsonb('attachments')
		table.boolean('read').notNullable().defaultTo(false)

		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
		table.timestamp('edited_at')

		table.bigint('poster').notNullable().references('posters.id')
		table.bigint('stream').notNullable().references('streams.id')
	})

	.createTable('reactions', function(table)
	{
		table.bigIncrements('id').primary().unsigned()

		table.bigint('post').notNullable().references('posts.id')
		table.bigint('poster').notNullable().references('posters.id')
	})

	.createTable('subscriptions', function(table)
	{
		table.primary(['stream', 'subscriber'])

		table.bigint('stream').notNullable().references('streams.id')
		table.bigint('subscriber').notNullable().references('user.id')

		// `poster` is here for faster querying (minor optimization).
		table.bigint('poster').notNullable().references('posters.id')
	})

	.createTable('merchandise', function(table)
	{
		table.bigIncrements('id').primary().unsigned()

		// `name` and `description` columns are gonna hold JSON objects
		// with 2-letter language code keys, like `{ ru: 'Подушка', en: 'Pillow' }`
		table.jsonb('name').notNullable()
		table.jsonb('description').notNullable()

		// `price` is gonna be different for different currencies
		// (https://ru.wikipedia.org/wiki/ISO_4217),
		// like `{ RUR: 1000, USD: 300 }`.
		// The integer value is in cents (for precision).
		table.jsonb('price').notNullable()

		table.int('count')
		table.boolean('sold').notNullable().defaultTo(false)

		table.bigint('seller').notNullable().references('posters.id')
		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
	})

	.createTable('purchases', function(table)
	{
		table.bigIncrements('id').primary().unsigned()

		table.bigint('merchandise').notNullable().references('merchandise.id')
		table.bigint('buyer').notNullable().references('users.id')

		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
		table.timestamp('paid_at')
		table.timestamp('shipped_at')
		table.timestamp('delivered_at')
		table.timestamp('cancelled_at')

		// In some future a `delivery_methods` table will be created
		// and `delivery_method` column will point to a record in that table.
		table.string('delivery_method_name', 64)
		table.string('tracking_number', 64)
	})

	// Add `coordinates` column
	.raw(`ALTER TABLE images ADD COLUMN coordinates GEOMETRY(Point, 4326)`)
}

exports.down = function(knex, Promise)
{
}