// https://github.com/gpbl/isomorphic500/blob/master/src/utils/getIntlMessage.js

// Similar to react-intl's Mixin `getIntlMessage`, but it receives the messages
// as argument. It is used by the IntlStore the get a message from its path

export default function translate(messages, path)
{
	let message

	try
	{
		return message = path.split('.').reduce((object, path_part) => object[path_part], messages)
	}
	finally
	{
		if (!exists(message))
		{
			throw new ReferenceError(`Could not find Intl message: ${path}`)
		}
	}
}