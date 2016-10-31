const role_permissions =
{
	moderator:
	{
		'block user'   : true,
		// 'unblock user' : true
	}
}

export default function can(action, user)
{
	if (!user)
	{
		return false
	}

	if (user.role === 'administrator')
	{
		return true
	}

	const permissions = role_permissions[user.role]

	if (!permissions)
	{
		return false
	}

	return permissions[action]
}