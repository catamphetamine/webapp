import React, { PropTypes } from 'react'
import { Link } from 'react-router'

export default function User({ children })
{
	const user = children
	return <Link to={User.url(user)}>{user.name}</Link>
}

User.propTypes =
{
	children: PropTypes.object.isRequired
}

User.url = function(user)
{
	return `/user/${user.alias || user.id}`
}