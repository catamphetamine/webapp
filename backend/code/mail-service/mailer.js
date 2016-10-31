import path from 'path'
import nodemailer from 'nodemailer'
import EmailTemplates from 'swig-email-templates'
import translator, { escape_html } from './translate'

// Can use `nunjucks` templates instead of `swig` ones,
// because `swig` is no longer maintained.

const templates = new EmailTemplates
({
	root: path.join(__dirname, 'templates'),
	swig:
	{
		cache: process.env.NODE_ENV === 'production' ? 'memory' : undefined // Don't cache swig templates in development mode
	}
})

let transporter

if (configuration.mail_service.smtp)
{
	// create reusable transporter object using the default SMTP transport
	transporter = nodemailer.createTransport
	({
		// pool   : true,
		host   : configuration.mail_service.smtp.host,
		port   : configuration.mail_service.smtp.port,
		secure : configuration.mail_service.smtp.secure, // use SSL
		auth:
		{
			user : configuration.mail_service.smtp.username,
			pass : configuration.mail_service.smtp.password
		}
	})
}
else
{
	log.warn(`SMTP server connection not set up because no configuration was supplied. Emails won't be sent.`)

	transporter =
	{
		send(options)
		{
			log.info(`Email wasn't sent. Configure SMTP server connection to be able to send emails.`)
			log.info(``)
			log.info(`From:`, options.from)
			log.info(`To:`, options.to)
			log.info(`Subject:`, options.subject)
			log.info(``)
			log.info(`Text:`, options.text)
			log.info(``)
			log.info(`Html:`, options.html)

			return Promise.resolve({})
		},

		templateSender(renderer, defaults)
		{
			return function(options, parameters)
			{
				options = merge(options, defaults)

				return new Promise((resolve, reject) =>
				{
					renderer.render(parameters, function(error, result)
					{
						if (error)
						{
							return reject(error)
						}

						const { text, html } = result

						log.info(`Email wasn't sent. Configure SMTP server connection to be able to send emails.`)
						log.info(``)
						log.info(`From:`, options.from)
						log.info(`To:`, options.to)
						log.info(`Subject:`, options.subject)
						log.info(``)
						log.info(`Text:`)
						log.info(``)
						log.info(text)
						log.info(``)
						log.info(`Html:`)
						log.info(``)
						log.info(html)

						return resolve({})
					})
				})
			}
		}
	}
}

// Sends an email
//
// result:
//
//   {
//     accepted: [ 'kuchumovn@gmail.com' ],
//     rejected: [],
//     response: '250 2.0.0 OK 1466966182 10sm2665723ljf.5 - gsmtp',
//     envelope: { from: 'foo@blurdybloop.com', to: [ 'kuchumovn@gmail.com' ] },
//     messageId: '1466966180973-163d30e0-385d833d-b4fd9ecf@blurdybloop.com'
//   }

export async function send(options, template, parameters, locale)
{
	const translate = await translator(locale)

	if (!template)
	{
		if (!options.from)
		{
			options.from = configuration.mail_service.mail.from
		}

		return transporter.send(options)
	}

	const send = transporter.templateSender
	({
		render: function(parameters, callback)
		{
			templates.render(`${template}.html`, parameters, function(error, html, text)
			{
				if (error)
				{
					return callback(error)
				}

				callback(undefined, { html, text })
			})
		}
	},
	{
		from: configuration.mail_service.mail.from,
		attachments:
		[{
			filename: 'logo.png',
			path: path.join(__dirname, 'templates/assets/logo.png'),
			cid: 'logo-content-id' // same cid value as in the html img src
		}]
	})

	options =
	{
		...options,
		subject : translate(options.subject)
	}

	const original_parameters = parameters

	const escaped_parameters = { ...parameters }
	for (let key of Object.keys(escaped_parameters))
	{
		escaped_parameters[key] = escape_html(escaped_parameters[key])
	}

	parameters =
	{
		...escaped_parameters,
		unescaped: original_parameters,
		translate
	}

	return send(options, parameters)
}