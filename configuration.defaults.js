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
			database: 'cinema'
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