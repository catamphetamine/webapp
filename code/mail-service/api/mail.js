// This is an example of a simple REST Api implementation.
//
// For debugging you can use "Advanced REST Client" for Google Chrome:
// https://chrome.google.com/webstore/detail/advanced-rest-client/hgmloofddffdnphfgcellkdfbfbjeloo

import { send } from '../mailer'

api.post('/', function({ to, subject, template, parameters }, { user })
{
	if (!user)
	{
		throw new Errors.Unauthenticated()
	}

	const from = configuration.mail_service.mail.from

	const text = 'Html should be shown'

	const html = template // .compile(parameters)

	send({ from, to, subject, text, html })
})

send
({
	from: '"Fred Foo 👥" <foo@blurdybloop.com>', // sender address
	to: 'kuchumovn@gmail.com', // list of receivers
	subject: 'Hello ✔', // Subject line
	text: 'Plain text Hello world 🐴', // plaintext body
	html: '<b>Hello world 🐴</b>' // html body
})