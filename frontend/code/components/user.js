import React, { PropTypes } from 'react'
import { Link } from 'react-router'

export default function User({ children })
{
	const user = children
	return <Link to={`/user/${user.alias || user.id}`}>{user.name}</Link>
}

User.propTypes =
{
	children: PropTypes.object.isRequired
}