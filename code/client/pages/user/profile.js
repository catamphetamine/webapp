import React, { Component, PropTypes } from 'react'
import { title }                       from 'react-isomorphic-render'
import { preload }                     from 'react-isomorphic-render/redux'
import { connect }                     from 'react-redux'
import styler                          from 'react-styling'
import React_time_ago                  from 'react-time-ago'
import classNames                      from 'classnames'

import { defineMessages, FormattedRelative }          from 'react-intl'

import { bindActionCreators as bind_action_creators } from 'redux'

import { get_user, get_users_latest_activity_time }  from '../../actions/users'
import { update_user, upload_user_picture, save_user_picture } from '../../actions/profile'

import Text_input  from '../../components/text input'
import Button      from '../../components/button'
import Dropdown    from '../../components/dropdown'
import File_upload from '../../components/file upload'
import Image       from '../../components/image'

import international from '../../international/internationalize'

const messages = defineMessages
({
	latest_activity_time:
	{
		id             : `user.profile.latest_activity_time`,
		description    : `This user's most recent activity time`,
		defaultMessage : `{gender, select, 
							male   {Last seen}
							female {Last seen}
							other  {Last seen}}`
	},
	edit_profile:
	{
		id             : `user.profile.edit`,
		description    : `Edit user's own profile action`,
		defaultMessage : `Edit`
	},
	cancel_profile_edits:
	{
		id             : `user.profile.cancel_editing`,
		description    : `Cancel user's own profile edits`,
		defaultMessage : `Cancel`
	},
	save_profile_edits:
	{
		id             : `user.profile.save`,
		description    : `Save user's own profile edits`,
		defaultMessage : `Save`
	},
	change_user_picture:
	{
		id             : `user.profile.change_user_picture`,
		description    : `An action label to change user picture`,
		defaultMessage : `Change picture`
	},
	send_message:
	{
		id             : `user.profile.send_message`,
		description    : `An action label to contact the user`,
		defaultMessage : `Contact`
	},
	subscribe:
	{
		id             : `user.profile.subscribe`,
		description    : `An action label to subscribe to this user's activity updates`,
		defaultMessage : `Subscribe`
	},
	update_error:
	{
		id             : `user.profile.update_error`,
		description    : `Failed to update user's own profile`,
		defaultMessage : `Couldn't update your profile`
	},
	user_picture_upload_error:
	{
		id             : `user.profile.user_picture_upload_error`,
		description    : `Failed to upload user picture`,
		defaultMessage : `Couldn't process the picture`
	}
})

@preload((dispatch, get_state, location, parameters) =>
{
	return Promise.all
	([
		dispatch(get_user(parameters.id)),
		dispatch(get_users_latest_activity_time(parameters.id))
	])
})
@connect
(
	model =>
	({
		current_user         : model.authentication.user,

		user                 : model.user_profile.user,
		latest_activity_time : model.user_profile.latest_activity_time,

		user_update_error         : model.user_profile.update_error,
		user_picture_upload_error : model.user_profile.user_picture_upload_error,

		uploaded_picture : model.user_profile.uploaded_picture,

		locale : model.locale.locale
	}),
	dispatch => bind_action_creators
	({
		update_user,
		upload_user_picture,
		save_user_picture,
		dispatch
	},
	dispatch)
)
@international()
export default class User_profile extends Component
{
	state = {}

	static propTypes =
	{
		current_user         : PropTypes.object,

		user                 : PropTypes.object.isRequired,
		latest_activity_time : PropTypes.object,
		user_update_error    : PropTypes.any,

		uploaded_picture     : PropTypes.object,

		locale               : PropTypes.string.isRequired,

		update_user          : PropTypes.func.isRequired,
		upload_user_picture  : PropTypes.func.isRequired,
		save_user_picture    : PropTypes.func.isRequired,
		dispatch             : PropTypes.func.isRequired
	}

	static contextTypes =
	{
		intl: PropTypes.object
	}

	constructor(props, context)
	{
		super(props, context)

		this.edit_profile         = this.edit_profile.bind(this)
		this.cancel_profile_edits = this.cancel_profile_edits.bind(this)
		this.save_profile_edits   = this.save_profile_edits.bind(this)

		this.send_message = this.send_message.bind(this)
		this.subscribe    = this.subscribe.bind(this)

		this.upload_user_picture = this.upload_user_picture.bind(this)

		// fill two-letter country codes list

		this.countries = []

		for (let key of Object.keys(context.intl.messages))
		{
			if (key.starts_with('country.'))
			{
				key = key.substring('country.'.length)
				if (key.length === 2)
				{
					this.countries.push(key)
				}
			}
		}

		this.countries = this.countries.filter(code => code !== 'ZZ')
			.map(code =>
			({
				value: code,
				label: context.intl.messages[`country.${code}`]
			}))
			.sort((a, b) => a.label.localeCompare(b.label, this.props.locale))
	}

	render()
	{
		const { edit } = this.state

		const
		{
			user,
			translate,
			current_user,
			latest_activity_time,
			user_update_error,
			user_picture_upload_error,
			uploaded_picture
		}
		= this.props

		const is_own_profile = current_user && current_user.id === user.id

		const markup = 
		(
			<div className="content  user-profile">
				{title(user.name)}

				{/* Left column */}
				<div className="column-m-6-of-12">

					{/* User's personal info */}
					<section
						className={classNames(
							'content-section',
							'user-profile__personal-info'
						)}
						style={style.personal_info}>

						{/* Edit/Save own profile */}
						{ is_own_profile &&
							<div style={style.own_profile_actions} className="user-profile__actions">

								{/* "Edit profile" */}
								{ !edit && 
									<Button 
										style={style.own_profile_actions.action}
										button_style={style.own_profile_actions.action.button}
										action={this.edit_profile}>
										{translate(messages.edit_profile)}
									</Button>
								}

								{/* "Cancel changes" */}
								{  edit && 
									<Button 
										style={style.own_profile_actions.action}
										button_style={style.own_profile_actions.action.button}
										action={this.cancel_profile_edits}>
										{translate(messages.cancel_profile_edits)}
									</Button>
								}

								{/* "Save changes" */}
								{  edit && 
									<Button 
										style={style.own_profile_actions.action}
										buttonClassName="primary"
										button_style={style.own_profile_actions.action.button}
										action={this.save_profile_edits}>
										{translate(messages.save_profile_edits)}
									</Button>
								}

								{ (user_update_error || user_picture_upload_error) &&
									<ul style={style.own_profile_actions.error} className="errors">
										{user_update_error && <li>{translate(messages.update_error)}</li>}
										{user_picture_upload_error && <li>{translate(messages.user_picture_upload_error)}</li>}
									</ul>
								}
							</div>
						}

						{/* User picture */}
						<div
							style={style.user_picture}
							className={classNames(
								'user-picture',
								'user-picture--profile',
								'card'
							)}>
							
							{/* The picture itself */}
							<Image
								style={style.user_picture.element.image}
								type="user_picture"
								max_width={1000}
								{...this.get_user_picture()}/>

							{/* "Change user picture" overlay */}
							{ edit && !uploaded_picture &&
								<div
									className="user-profile__picture__change__overlay"
									style={style.user_picture.element.overlay.background}/>
							}

							{/* "Change user picture" file uploader */}
							{ edit &&
								<File_upload
									className="user-profile__picture__change__label"
									style={style.user_picture.element.overlay.label}
									action={this.upload_user_picture}>

									{/* "Change user picture" label */}
									{!uploaded_picture && translate(messages.change_user_picture)}
								</File_upload>
							}
						</div>

						{/* Name: "John Brown" */}
						{ edit ?
							<Text_input
								style={style.user_name.edit}
								input_style={style.user_name.edit}
								value={this.state.name}
								on_change={name => this.setState({ name })}/>
							:
							<h1 style={style.user_name.idle}>{user.name}</h1>
						}

						{/* Place: "Moscow" */}
						{ edit &&
							// City, town, etc
							<Text_input
								value={this.state.place}
								on_change={place => this.setState({ place })}/>
						}

						{/* Country: "Russia" */}
						{ edit &&
							// Country
							<Dropdown
								options={this.countries}
								value={this.state.country}
								on_change={country => this.setState({ country })}/>
						}

						{ !edit &&
							(user.place && user.country &&
								<div
									style={style.user_location}
									className="user-profile__location">
									{user.place + ', ' + translate({ id: `country.${user.country}` })}
								</div>
							)
						}

						{/* "Send message", "Subscribe" */}
						{ !is_own_profile &&
							<div style={style.user_actions}>
								{/* "Subscribe" */}
								<Button
									style={style.user_actions.button}
									action={this.subscribe}>

									{/* Icon */}
									<i className="material-icons">person_add</i>
									{/* Text */}
									{translate(messages.subscribe)}
								</Button>

								{/* "Send message" */}
								<Button
									style={style.user_actions.button.last}
									action={this.send_message}>

									{/* Icon */}
									<i className="material-icons">chat_bubble_outline</i>
									{/* Text */}
									{translate(messages.send_message)}
								</Button>
							</div>
						}

						{/* Online status: "Last seen: an hour ago" */}
						{ latest_activity_time &&
							<div style={style.latest_activity} className="user-profile__last-seen">
								{/* Icon */}
								<i className="material-icons">schedule</i>
								{/* "an hour ago" */}
								<React_time_ago date={latest_activity_time}/>
							</div>
						}
					</section>
				</div>
			</div>
		)

		return markup
	}

	edit_profile()
	{
		const { user } = this.props

		this.setState
		({
			edit: true,

			name     : user.name,
			country  : user.country,
			place    : user.place
		})
	}

	cancel_profile_edits()
	{
		this.dismiss_user_info_edit_errors()

		this.setState({ edit: false })
		this.props.dispatch({ type: 'dismiss uploaded user picture' })
	}

	async save_profile_edits()
	{
		this.dismiss_user_info_edit_errors()

		const { uploaded_picture } = this.props

		if (uploaded_picture)
		{
			await this.props.save_user_picture(uploaded_picture)
		}

		await this.props.update_user
		({
			name    : this.state.name,
			country : this.state.country,
			place   : this.state.place
		})

		this.setState({ edit: false })
		this.props.dispatch({ type: 'dismiss uploaded user picture' })
	}

	dismiss_user_info_edit_errors()
	{
		this.props.dispatch({ type: 'dismiss user update error' })
		this.props.dispatch({ type: 'dismiss user picture upload error' })
	}

	send_message()
	{

	}

	subscribe()
	{

	}

	async upload_user_picture(file)
	{
		await this.props.upload_user_picture(file)
	}

	get_user_picture()
	{
		const { user, uploaded_picture } = this.props

		if (this.state.edit && uploaded_picture)
		{
			return uploaded_picture
		}
		
		if (user.picture)
		{
			return user.picture
		}

		return { src: require('../../../../assets/images/no user picture.png') }
	}
}

const style = styler
`
	user_picture
		position: relative

		element
			position         : absolute
			top              : 0
			left             : 0

			width            : 100%
			height           : 100%
			border-radius    : inherit

			&overlay
				cursor           : pointer

				&background
					opacity          : 0.5

				&label
					display     : flex
					align-items : center
					text-align  : center
					color       : white
					text-shadow : 0 0.05em 0.1em rgba(0, 0, 0, 0.75)
					user-select : none

			&image

	header
		text-align : center

	user_name
		font-size     : 1.5rem
		margin-bottom : 0em

		&idle

		&edit
			margin-top : 1em

	user_location
		margin-top : 0.2em

	latest_activity
		margin-top : 1.2rem
		cursor     : default

	personal_info
		// display: inline-block

	user_actions
		margin-top: 1em

		button
			display: block
			margin-bottom: 0.3em

			&last
				margin-bottom: 0

	own_profile_actions
		float      : right
		margin-top : -0.4em
		text-align : right

		action
			display        : inline-block

			button
				text-transform : lowercase

		error
			margin-top: 0.5em
`