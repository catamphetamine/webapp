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
		// (Photoshop quality: 8)
		//
		// 6500w = 4.8 MB
		// 6000w = 4.3 MB
		// 5000w = 3.3 MB
		// 4500w = 3.0 MB
		// 4100w = 2.6 MB
		// 3600w = 2.2 MB
		// 2800w = 1.7 MB
		// 2100w = 1.3 MB
		// 1500w = 1.0 MB
		// 1000w = 850 KB
		// 900w  = 800 KB
		// 750w  = 750 KB
		// 400w  = 650 KB
		// 300w  = 600 KB
		// 100w  = 500 KB
		//
		// ~ 5 MB per photo
		//
		sizes:
		[
			360,  // 0.6 MB
			1080, // 0.9 MB
			1920, // 1.2 MB
			4096, // 2.5 MB
			7680  // 6.0 MB
		],
		type:
		{
			poster_picture:
			{
				square: true,
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
	access_token_cookie: 'authentication',
	access_token_refresh_cookie: 'authentication.refresh',
	access_token_lifespan: '15 minutes',
	// upload_folder: 'storage',
	access_token_payload:
	{
		// Populates a new access token payload
		write: (user, refresh_token_id) =>
		({
			refresh_token_id,
			roles : user.roles,
			// moderation : user.moderation,
			// switches   : user.switches
		}),
		// Reads `user` from an access token payload
		read: (payload) =>
		({
			access_token_id : payload.refresh_token_id,
			roles           : payload.roles,
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