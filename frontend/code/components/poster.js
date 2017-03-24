import React, { PropTypes } from 'react'
import { Link } from 'react-isomorphic-render'

export default function Poster({ children })
{
	const poster = children

	const markup =
	(
		<Link to={ Poster.url(poster) }>
			{ poster.name }
		</Link>
	)

	return markup
}

Poster.propTypes =
{
	children: PropTypes.object.isRequired
}

Poster.url = function(poster)
{
	return `/${poster.alias || poster.id}`
}