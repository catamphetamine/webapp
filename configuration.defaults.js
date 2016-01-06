module.exports = 
{
	api_server:
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
	image_server:
	{
		http: 
		{
			host: '127.0.0.1',
			port: 3003
		},
		temporary_files_directory: 'upload_temporary_storage',
		temporary_image_expiration_interval: { days: 1 }, 
		clean_up_interval: { hours: 1 }
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
		}
	},
	log_server: 
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
	upload_folder: 'upload'
}