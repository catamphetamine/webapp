if (process.env.NODE_ENV !== 'production')
{
	require('bluebird').longStackTraces()
}

require('./application')