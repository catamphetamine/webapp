import React, { Component, PropTypes } from 'react'
import { title }                       from 'react-isomorphic-render'
import { preload }                     from 'react-isomorphic-render/redux'
import { connect }                     from 'react-redux'
import styler                          from 'react-styling'
import classNames                      from 'classnames'
import { defineMessages }              from 'react-intl'

import { bindActionCreators as bind_action_creators } from 'redux'

import international from '../../international/internationalize'

import
{
	get_user,
	get_user_authentication_tokens
}
from '../../actions/user settings/main'

import default_messages from '../../components/messages'

// import Text_input      from '../../components/text input'
import Button          from '../../components/button'
import Content_section from '../../components/content section'
// import Editable_field  from '../../components/editable field'

import Change_email    from './settings change email'
import Change_password from './settings change password'
import Authentication_tokens from './settings authentication tokens'

const messages = defineMessages
({
	header:
	{
		id             : 'user.settings.header',
		description    : 'User account settings page header',
		defaultMessage : 'Settings'
	},
	show_advanced_settings:
	{
		id             : 'user.settings.show_advanced_settings',
		description    : 'Show user account\'s advanced settings',
		defaultMessage : 'Show advanced settings'
	},
	change_email_failed:
	{
		id             : 'user.settings.could_not_change_email',
		description    : `Couldn't change user's email to a new one`,
		defaultMessage : `Couldn't change your email`
	},
	save_settings_failed:
	{
		id             : 'user.settings.could_not_save',
		description    : `Couldn't save new user's settings`,
		defaultMessage : `Couldn't save your settings`
	}
})

@preload(({ dispatch, getState }) =>
{
	return Promise.all
	([
		dispatch(get_user(getState().authentication.user.id))
	])
})
@connect
(
	model =>
	({
		user : model.user_settings.main.user,

		load_advanced_settings_error   : model.user_settings.main.load_advanced_settings_error,
		load_advanced_settings_pending : model.user_settings.main.load_advanced_settings_pending,

		saving_settings                : model.user_settings.main.saving_settings
	}),
	dispatch =>
	({
		dispatch,
		...bind_action_creators
		({
			get_user_authentication_tokens
		},
		dispatch)
	})
)
@international()
export default class Settings_page extends Component
{
	static propTypes =
	{
		user                  : PropTypes.object.isRequired,
		authentication_tokens : PropTypes.array,

		load_advanced_settings_pending : PropTypes.bool,
		load_advanced_settings_error   : PropTypes.object,

		get_user_authentication_tokens : PropTypes.func.isRequired,

		saving_settings               : PropTypes.bool
	}

	state = {}

	constructor(props, context)
	{
		super(props, context)

		this.load_advanced_settings      = this.load_advanced_settings.bind(this)
	}

	render()
	{
		const
		{
			user,
			authentication_tokens,
			translate,
			saving_settings,
			load_advanced_settings_pending,
			load_advanced_settings_error,
			revoking_authentication_token
		}
		= this.props

		const
		{
			showing_advanced_settings
		}
		= this.state

		const markup =
		(
			<div className="content user-settings">
				{/* "Settings" */}
				{title(translate(messages.header))}

				{/* General settings */}
				<div className="row row--content-sections">
					<div className="column-l-6-of-12">
						{/* User's personal info */}

						{/* "Settings" */}
						<Content_section
							title={translate(messages.header)}
							busy={saving_settings}>

							{/* User's email */}
							<Change_email/>

							{/* User's password */}
							<Change_password/>
						</Content_section>
					</div>
				</div>

				{/* Aadvanced settings */}
				<div className="row row--content-sections">
					<div className="column-l-6-of-12">
						{/* "Show advanced settings" */}
						{ !showing_advanced_settings &&
							<div className="background-section">
								{/* "Show advanced settings" button */}
								{ !showing_advanced_settings &&
									<Button
										busy={load_advanced_settings_pending}
										action={this.load_advanced_settings}
										style={style.show_advanced_settings}>
										{translate(messages.show_advanced_settings)}
									</Button>
								}

								{/* Error while loading advanced settings */}
								{ load_advanced_settings_error &&
									<div className="error">{translate(default_messages.error)}</div>
								}
							</div>
						}

						{/* Authentication tokens */}
						{ showing_advanced_settings &&
							<Authentication_tokens/>
						}
					</div>
				</div>
			</div>
		)

		return markup
	}

	async load_advanced_settings()
	{
		try
		{
			this.props.dispatch({ type: 'user settings: load advanced settings pending' })

			await this.props.get_user_authentication_tokens()

			this.props.dispatch({ type: 'user settings: load advanced settings done' })
		}
		catch (error)
		{
			console.error(error)
			return this.props.dispatch({ type: 'user settings: load advanced settings failed', error: true })
		}

		this.setState({ showing_advanced_settings: true })
	}
}

const style = styler
`
	email
		width: 100%

	show_advanced_settings
		// margin-top: var(--content-section-padding)

	change_button
		margin-left: 1em
`
