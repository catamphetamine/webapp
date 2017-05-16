const role_permissions =
{
	moderator:
	{
		'block poster'   : true,
		// 'unblock user' : true
	}
}

export default function can(action, user)
{
	if (!user)
	{
		return false
	}

	if (user.roles.has('administrator'))
	{
		return true
	}

	for (const role of user.roles)
	{
		const permissions = role_permissions[role]

		if (permissions && permissions[action])
		{
			return true
		}
	}
}