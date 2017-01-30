// https://codeascraft.com/2011/02/15/measure-anything-measure-everything/
import StatsD from 'lynx'

export default function(settings = {})
{
	let statsd

	const metrics =
	{
		// report(stats)
		// {
		// 	if (!settings.report)
		// 	{
		// 		return
		// 	}
		//
		// 	if (settings.threshold)
		// 	{
		// 		if (stats.time < settings.threshold)
		// 		{
		// 			return
		// 		}
		// 	}
		//
		// 	return settings.report(stats)
		// },

		// Reports a value
		report(name, value)
		{
			if (!statsd)
			{
				return
			}

			statsd.gauge(name, value)
		},

		// Increments a counter
		increment(name)
		{
			if (!statsd)
			{
				return
			}

			statsd.increment(name)
		},

		// // Measures how much an action takes
		// measure: (name, action) =>
		// {
		// 	const finished = metrics.started(name)
		//
		// 	let result
		//
		// 	try
		// 	{
		// 		result = action()
		// 	}
		// 	catch (error)
		// 	{
		// 		finished()
		// 		throw error()
		// 	}
		//
		// 	if (typeof result.then === 'function')
		// 	{
		// 		// No `.finally()` on `Promise`
		// 		return result.then(finished, (error) =>
		// 		{
		// 			finished()
		// 			return Promise.reject(error)
		// 		})
		// 	}
		//
		// 	finished()
		// 	return result
		// },

		// Starts a timer.
		// The returned function stops the timer
		// and returns the time elapsed.
		started(name)
		{
			if (!statsd)
			{
				return () => {}
			}

			const timer = statsd.createTimer(name)
			return () => timer.stop()
		},

		// Writes StatsD timing value
		time(name, value)
		{
			if (!statsd)
			{
				return
			}

			statsd.timing(name, value)
		},

		// Reports an error (e.g. StatsD connection error)
		error(error)
		{
			if (settings.log)
			{
				return settings.log.error(error)
			}

			console.error(error)
		},

		// Closes StatsD connection
		close()
		{
			if (!statsd)
			{
				return
			}

			statsd.close()
		}
	}

	if (settings.statsd)
	{
		statsd = new StatsD(settings.statsd.host, settings.statsd.port,
		{
			on_error : metrics.error,
			scope    : settings.statsd.prefix
		})
	}

	return metrics

	// const finished = metrics.started('cache')
	// ...
	// finished()
}