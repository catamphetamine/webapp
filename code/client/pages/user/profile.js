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

import Text_input from '../../components/text input'
import Button from '../../components/button'

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
		latest_activity_time : model.user_profile.latest_activity_time
	})
)
@international()
export default class User_profile extends Component
{
	state = {}

	static propTypes =
	{
		current_user         : PropTypes.object,

		user                 : PropTypes.object.isRequired,
		latest_activity_time : PropTypes.object
	}

	constructor(props, context)
	{
		super(props, context)

		this.edit_profile         = this.edit_profile.bind(this)
		this.cancel_profile_edits = this.cancel_profile_edits.bind(this)
		this.save_profile_edits   = this.save_profile_edits.bind(this)
	}

	render()
	{
		const { edit } = this.state
		const { user, translate, current_user } = this.props

		const user_picture = user.picture ? `/upload/user_pictures/${user.id}.jpg` : require('../../../../assets/images/no user picture.png')

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
						{ current_user && current_user.id === user.id &&
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
						</div> }

						{/* User picture */}
						<div
							style={style.user_picture}
							className={classNames(
								'user-picture',
								'user-picture--profile',
								'card'
							)}>
							
							{/* The picture itself */}
							<img
								style={style.user_picture.element.image}
								src={user_picture}/>

							{/* "Change user picture" overlay */}
							{ edit && 
								<div style={style.user_picture.element.overlay.background}/>
							}

							{/* "Change user picture" label */}
							{ edit &&
								<label
									className="user-profile__picture__change__label"
									style={style.user_picture.element.overlay.label}>
									{translate(messages.change_user_picture)}
								</label>
							}
						</div>

						{/* Name: "John Brown" */}
						{ edit ?
							<Text_input
								style={style.user_name.edit}
								input_style={style.user_name.edit}
								value={this.state.name}/>
							:
							<h1 style={style.user_name.idle}>{user.name}</h1>
						}

						{/* From: "Moscow, Russia" */}
						{ edit ?
							[
								// City
								<Text_input
									value={this.state.city}/>,

								// Country
								<Text_input
									value={this.state.country}/>
							]
							:
							(user.city && user.country &&
								<div
									style={style.user_location}
									className="user-profile__location">
									{user.city + ', ' + translate({ id: `country.${user.country}` })}
								</div>
							)
						}

						{/* Online status: "Last seen: an hour ago" */}
						{this.render_latest_activity_time()}
					</section>
				</div>
			</div>
		)

		return markup
	}

	// "Last seen 2 days ago"
	render_latest_activity_time()
	{
		const { latest_activity_time, translate } = this.props

		if (!latest_activity_time)
		{
			return null
		}

		const markup =
		(
			<div style={style.latest_activity} className="user-profile__last-seen">
				{/* "Last seen" */}
				{translate(messages.latest_activity_time, { gender: null })}
				<span>&nbsp;</span>

				{/* how long ago the user was online */}
				<span style={style.latest_activity_time} className="user-profile__last-seen__time">
					<React_time_ago date={latest_activity_time}/>
				</span>
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
			city     : user.city
		})
	}

	cancel_profile_edits()
	{
		this.setState({ edit: false })
	}

	save_profile_edits()
	{
		this.setState({ edit: false })
	}
}

const style = styler
`
	user_picture
		position: relative

		element
			width            : 100%
			height           : 100%
			border-radius    : inherit

			&overlay
				position         : absolute
				top              : 0
				left             : 0
				cursor           : pointer

				&background
					background-color : black
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
		// opacity    : 0.5

	latest_activity_time

	personal_info
		// display: inline-block

	own_profile_actions
		float      : right
		margin-top : -0.4em

		action
			display        : inline-block

			button
				text-transform : lowercase
`