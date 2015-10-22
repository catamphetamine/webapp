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
		temporary_files_directory: 'build/assets/images_temporary_store'
	},
	webpage_server: 
	{
		http: 
		{
			host: '127.0.0.1',
			port: 3004
		}
	},
	webserver: 
	{
		http: 
		{
			host: '127.0.0.1',
			port: 3000
		}
	},
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
	}
}