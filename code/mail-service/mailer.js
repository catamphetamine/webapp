import nodemailer from 'nodemailer'

let transporter

if (configuration.mail_service.smtp)
{
	// create reusable transporter object using the default SMTP transport
	transporter = nodemailer.createTransport(`smtps://${configuration.mail_service.smtp.username}:${configuration.mail_service.smtp.password}@${configuration.mail_service.smtp.server}`)
}
else
{
	log.warn(`SMTP server connection not set up because no configuration was supplied. Emails won't be sent.`)

	transporter =
	{
		sendMail(options, callback)
		{
			log.info(`Email wasn't sent. Configure SMTP server connection to be able to send emails.`)
			log.info(``)
			log.info(`From: ${options.from}`)
			log.info(`To: ${options.to}`)
			log.info(``)
			log.info(`Subject: ${options.subject}`)
			log.info(``)
			log.info(`Text: ${options.text}`)
			log.info(``)
			log.info(`Html: ${options.html}`)

			return callback(undefined, {})
		}
	}
}

// Sends an email
export function send(options)
{
	return new Promise((resolve, reject) =>
	{
		// send mail with defined transport object
		transporter.sendMail(options, function(error, info)
		{
			if (error)
			{
				return reject(error)
			}

			resolve(info)
		})
	})
}