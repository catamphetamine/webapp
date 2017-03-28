import path from 'path'
import nodemailer from 'nodemailer'
import { merge } from 'lodash'

import Templates from './templates'
import translator, { escape_html } from './translate'

const templates = new Templates
({
	root: path.join(__dirname, 'templates')
})

export default class Mailer
{
	constructor()
	{
		if (configuration.mail_service.smtp)
		{
			// create reusable transporter object using the default SMTP transport
			this.transporter = nodemailer.createTransport
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

			this.transporter =
			{
				sendMail(options)
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

								const { text, html, subject } = result

								log.info(`Email wasn't sent. Configure SMTP server connection to be able to send emails.`)
								log.info(``)
								log.info(`From:`, options.from)
								log.info(`To:`, options.to)
								log.info(`Subject:`, subject || options.subject)
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
				},

				close()
				{
					return false
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
	//
	// Returns a `Promise`
	//
	async send(options, template, parameters, locale)
	{
		// For simple plaintext emails, without using templates
		if (!template)
		{
			if (!options.from)
			{
				options.from = configuration.mail_service.mail.from
			}

			return transporter.sendMail(options)
		}

		const translate = translator(locale)

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

		const rendered = await templates.render(template, parameters)

		const mail_data = merge
		({
			from    : options.from || configuration.mail_service.mail.from,
			to      : options.to,
			subject : options.subject && translate(options.subject),
			attachments:
			[{
				filename: 'logo.png',
				path: path.join(__dirname, 'templates/assets/logo.png'),
				cid: 'logo-content-id' // same cid value as in the html img src
			}]
		},
		rendered)

		return await transporter.sendMail(mail_data)
	}

	close()
	{
		return new Promise((resolve, reject) =>
		{
			function callback(error)
			{
				if (error)
				{
					return reject(error)
				}

				return resolve()
			}

			if (this.transporter.close(callback) === false)
			{
				return resolve()
			}
		})
	}
}