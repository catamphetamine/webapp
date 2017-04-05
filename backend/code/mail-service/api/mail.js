// This is an example of a simple REST Api implementation.
//
// For debugging you can use "Advanced REST Client" for Google Chrome:
// https://chrome.google.com/webstore/detail/advanced-rest-client/hgmloofddffdnphfgcellkdfbfbjeloo

import { errors } from 'web-service'

import start_metrics from '../../../../code/metrics'

const metrics = start_metrics
({
	statsd:
	{
		...configuration.statsd,
		prefix : 'mail'
	}
})

export default function(mailer)
{
	return function(api)
	{
		api.post('/', async function({ to, subject, template, parameters, locale })
		{
			if (!locale)
			{
				throw new errors.Input_rejected(`"locale" is required`)
			}

			metrics.increment('count')

			await mailer.send({ to, subject }, template, parameters, locale)
		})
	}

	// mailer.send
	// ({
	// 	from: '"Fred Foo 👥" <foo@blurdybloop.com>', // sender address
	// 	to: 'halt.hammerzeit.at@gmail.com', // list of receivers
	// 	subject: 'Hello ✔', // Subject line
	// 	text: 'Plain text Hello world 🐴', // plaintext body
	// 	html: '<b>Hello world 🐴</b>' // html body
	// })

	// mailer.send
	// ({
	// 	from: '"Fred Foo 👥" <foo@blurdybloop.com>', // sender address
	// 	to: 'halt.hammerzeit.at@gmail.com', // list of receivers
	// 	subject: 'Hello ✔', // Subject line
	// },
	// 'reset password',
	// { token: 'abc' })
}