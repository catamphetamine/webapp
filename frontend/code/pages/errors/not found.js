import React, { Component } from 'react'
import { Title }            from 'react-isomorphic-render'
import { connect }          from 'react-redux'

import styler from 'react-styling'

import { defineMessages } from 'react-intl'
import international      from '../../international/internationalize'

import Url                    from '../../../../code/url'
import { should_redirect_to } from '../../helpers/redirection'

const messages = defineMessages
({
	header:
	{
		id             : 'not_found.header',
		description    : 'Not found page header',
		defaultMessage : 'Page not found'
	}
})

@international
export default class Page_not_found extends Component
{
	render()
	{
		const { translate } = this.props

		const markup =
		(
			<section className="content error-page">
				<Title>{ translate(messages.header) }</Title>

				<h1>
					{ translate(messages.header) }
				</h1>

				<Link
					to={ should_redirect_to(location) }
					className="error-page__page-link">

					{ new Url(should_redirect_to(location)).to_relative_url() }
				</Link>
			</section>
		)

		return markup
	}
}

const style = styler
`
`