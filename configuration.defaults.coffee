module.exports = 
	webserver: 
		http:
			port: 3000
		database: 
			host: "127.0.0.1"
			port: "5432"
			user: "postgres"
			password: "password"
			database: "cinema"
	development:
		webpack:
			development_server:
				port: 3001