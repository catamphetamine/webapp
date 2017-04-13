import React, { Component } from 'react'
import { Link, IndexLink } from 'react-isomorphic-render'
import { defineMessages } from 'react-intl'

import international from '../international/internationalize'
import default_messages from './messages'

@international
export default class Menu extends Component
{
	render()
	{
		const { className, translate } = this.props

		const markup =
		(
			<ul className={ className }>
				<li>
					<IndexLink
						to="/"
						className="rrui__menu__item menu__main-page-item"
						activeClassName="rrui__menu__item--selected">
						{ translate(default_messages.title) }
					</IndexLink>
				</li>
				<li>
					<Menu_item to="/logs">
						{ translate(messages.log) }
					</Menu_item>
				</li>
			</ul>
		)

		return markup
	}
}

function Menu_item({ to, children })
{
	const markup =
	(
		<Link
			to={ to }
			className="rrui__menu__item"
			activeClassName="rrui__menu__item--selected">
			{ children }
		</Link>
	)

	return markup
}

export const messages = defineMessages
({
	log:
	{
		id             : 'menu.log',
		description    : 'The section shows log messages from all the parts of the application',
		defaultMessage : 'Log'
	}
})