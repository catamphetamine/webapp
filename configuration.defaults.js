module.exports =
{
	website: 'webapp.com',
	support:
	{
		email: 'support@webapp.com'
	},
	authentication_service:
	{
		http:
		{
			port: 3006
		}
	},
	password_service:
	{
		http:
		{
			port: 3007
		}
	},
	user_service:
	{
		http:
		{
			port: 3008
		}
	},
	image_service:
	{
		http:
		{
			port: 3003
		},
		files_directory: 'storage/images',
		temporary_files_directory: 'temporary_storage',
		temporary_image_expiration_interval: { days: 1 },
		// Can only have a single key
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
			poster_picture:
			{
				square: true,
				path: 'poster_pictures',
				sizes:
				[
					300,
					600,
					1000
				]
			},
			poster_background_pattern:
			{
				path: 'poster_background_patterns',
				sizes:
				[
					2000
				]
			}
		}
	},
	webpage_server:
	{
		http:
		{
			port: 3004
		}
	},
	web_server:
	{
		http:
		{
			port: 3000
		},
		image_service_path: '/images'
	},
	log_service:
	{
		http:
		{
			port: 3005
		},
		tcp:
		{
			port: 3200
		}
	},
	mail_service:
	{
		http:
		{
			port: 3009
		},
		mail:
		{
			from: 'Webapp Support <support@webapp.com>'
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
	realtime_service:
	{
		http:
		{
			port: 3010
		},
		websocket:
		{
			port: 3100
		}
	},
	access_token_service:
	{
		http:
		{
			port: 3002
		}
	},
	social_service:
	{
		http:
		{
			port: 3011
		}
	},
	web_service_secret_keys: ['hammertime'],
	development:
	{
		webpack:
		{
			development_server:
			{
				port: 3001
			},
			isomorphic_tools:
			{
				port: 9999
			}
		}
	},
	// upload_folder: 'storage',
	access_token_payload:
	{
		write: (user) =>
		({
			role       : user.role,
			// moderation : user.moderation,
			// switches   : user.switches
		}),

		read: (payload) =>
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
	// },
	redis:
	{
		host : 'localhost',
		port : 6379
	},
}