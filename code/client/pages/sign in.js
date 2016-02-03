import React, { Component, PropTypes } from 'react'
import { title }                       from 'react-isomorphic-render'
import { connect }                     from 'react-redux'
import styler                          from 'react-styling'
import { defineMessages }              from 'react-intl'

import international from '../internationalize'

import Authentication_form from '../components/authentication form'

const messages = defineMessages
({
	header:
	{
		id             : 'sign_in.header',
		description    : 'Sign in page header',
		defaultMessage : 'Sign in'
	}
})

@connect
(
	store => ({ })
)
@international()
export default class Sign_in extends Component
{
	render()
	{
		const markup = 
		(
			<section className="content">
				{title("Sign in")}

				<Authentication_form style={style.form} on_sign_in={() =>
				{
					if (this.props.location.pathname === '/sign-in')
					{
						this.props.history.replace('/')
					}
					else // if (this.props.location.pathname === '/unauthenticated')
					{
						this.props.history.replace(this.props.location.query.request || '/')
					}
				}}/>
			</section>
		)

		return markup
	}
}

const style = styler
`
	header
		text-align: center

	form
		margin-top: 1.5em
`