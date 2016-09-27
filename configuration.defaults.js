module.exports =
{
	website: 'webapp.com',
	api_service:
	{
		http:
		{
			host: '127.0.0.1',
			port: 3002
		},
		database:
		{
			host: '127.0.0.1',
			port: 5432,
			user: 'postgres',
			password: 'password',
			database: 'webapp'
		}
	},
	authentication_service:
	{
		http:
		{
			host: '127.0.0.1',
			port: 3006
		}
	},
	password_service:
	{
		http:
		{
			host: '127.0.0.1',
			port: 3007
		}
	},
	user_service:
	{
		http:
		{
			host: '127.0.0.1',
			port: 3008
		}
	},
	image_service:
	{
		http:
		{
			host: '127.0.0.1',
			port: 3003
		},
		files_directory: 'storage/images',
		temporary_files_directory: 'temporary_storage',
		temporary_image_expiration_interval: { days: 1 },
		clean_up_interval: { hours: 1 },
		file_size_limit: '10mb',
		//
		// Estimated JPEG image file size based on image width (in pixels):
		//
		// 1500w = 1 MB
		// 1000w = 523 KB
		// 750w = 315 KB
		// 300w = 55 KB
		// 100w = 8 KB
		//
		sizes:
		[
			300,
			600,
			1000,
			1500,
			2100
			// 2800,
			// 3600,
			// 4500
		],
		type:
		{
			user_picture:
			{
				square: true,
				path: 'user_pictures',
				sizes:
				[
					300,
					600,
					1000
				]
			}
		}
	},
	webpage_server:
	{
		http:
		{
			host: '127.0.0.1',
			port: 3004
		}
	},
	web_server:
	{
		http:
		{
			host: '127.0.0.1',
			port: 3000
		},
		image_service_path: '/images'
	},
	log_service:
	{
		http:
		{
			host: '127.0.0.1',
			port: 3005
		},
		tcp:
		{
			host: '127.0.0.1',
			port: 3200,
			// Allowed IP subnets.
			// For more security set to local IPs only,
			// excluding the router IP (exclusions start with an exclamation sign)
			access_list: ['127.0.0.1/32', '192.168.0.0/16']
		}
	},
	mail_service:
	{
		http:
		{
			host: '127.0.0.1',
			port: 3009
		},
		// Allowed IP subnets.
		// For more security set to local IPs only,
		// excluding the router IP (exclusions start with an exclamation sign),
		access_list: ['127.0.0.1/32', '192.168.0.0/16'],
		mail:
		{
			from: 'Webapp Robot <robot@webapp.com>'
		},
		// e.g. SendGrid.com or MailGun.com
		// smtp:
		// {
		// 	username: 'username',
		// 	password: 'password',
		// 	host: 'smtp.gmail.com',
		// 	port: '465',
		// 	secure: true
		// }
	},
	web_service_secret_keys: ['hammertime'],
	development:
	{
		webpack:
		{
			development_server:
			{
				host: '127.0.0.1',
				port: 3001
			},
			isomorphic_tools:
			{
				port: 9999
			}
		}
	},
	// upload_folder: 'storage',
	authentication_token_payload:
	{
		write: user =>
		({
			role       : user.role,
			// moderation : user.moderation,
			// switches   : user.switches
		}),

		read: payload =>
		({
			role       : payload.role,
			// moderation : payload.moderation,
			// switches   : payload.switches
		})
	},
	// // https://github.com/nchaulet/node-geocoder
	// geocoding:
	// {
	// 	// Address to GPS coordinates
	// 	address:
	// 	{
	// 		provider: 'google',
	// 		key: '...'
	// 	},
	// 	// GPS coordinates to address
	// 	reverse:
	// 	{
	// 		provider: 'google',
	// 		key: '...'
	// 	},
	// 	// IP address to address
	// 	reverse_ip:
	// 	{
	// 		provider: 'freegeoip'
	// 	},
	// 	// Coordinates to timezone offset
	// 	timezone_by_coordinates:
	// 	{
	// 		provider: 'google',
	// 		key: '...'
	// 	}
	// }
}