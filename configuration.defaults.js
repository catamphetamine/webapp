module.exports = 
{
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
		sizes:
		[
			300,
			600,
			1000,
			1500,
			2100,
			2800,
			3600,
			4500
		],
		type:
		{
			user_picture:
			{
				square: true,
				path: 'user_pictures'
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
			port: 3200
		}
	},
	session_secret_keys: ['hammertime'],
	development:
	{
		webpack:
		{
			development_server:
			{
				host: '127.0.0.1',
				port: 3001
			}
		}
	},
	// upload_folder: 'storage',
	authentication_token_payload:
	{
		write: user =>
		({
			role       : user.role,
			moderation : user.moderation,
			switches   : user.switches
		}),

		read: payload =>
		({
			role       : payload.role,
			moderation : payload.moderation,
			switches   : payload.switches
		})
	}
}