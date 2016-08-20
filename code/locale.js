export function get_language_from_locale(locale)
{
	const dash_index = locale.indexOf('-')
	if (dash_index >= 0)
	{
		return locale.substring(0, dash_index)
	}
	return locale
}