import React, { Component, PropTypes } from 'react'
import { title }                       from 'react-isomorphic-render'
import { preload }                     from 'react-isomorphic-render/redux'
import { connect }                     from 'react-redux'
import styler                          from 'react-styling'

import { defineMessages, FormattedRelative }          from 'react-intl'

import { bindActionCreators as bind_action_creators } from 'redux'

import { get_user, get_users_latest_activity_time }  from '../../actions/users'

import international from '../../international/internationalize'

const messages = defineMessages
({
	// header:
	// {
	// 	id             : 'user.profile.header',
	// 	description    : 'User profile page header',
	// 	defaultMessage : 'Profile'
	// }
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
		user                 : model.user_profile.user,
		latest_activity_time : model.user_profile.latest_activity_time
	})
)
@international()
export default class User_profile extends Component
{
	static propTypes =
	{
		user                 : PropTypes.object.isRequired,
		latest_activity_time : PropTypes.object
	}

	render()
	{
		const { user } = this.props

		const user_picture = user.picture ? `/upload/user_pictures/${user.id}.jpg` : require('../../../../assets/images/no user picture.png')

		const markup = 
		(
			<section className="content">
				{title(user.name)}

				<h1 style={style.header}>
					{user.name}
				</h1>

				{/* Avatar */}
				<img className="user-picture" src={user_picture}/>

				<label style={style.user_name}>{user.name}</label>

				{this.render_latest_activity_time()}
			</section>
		)

		return markup
	}

	render_latest_activity_time()
	{
		const { latest_activity_time } = this.props

		if (!latest_activity_time)
		{
			return null
		}

		const markup =
		(
			<div>
				Latest activity:
				<span style={style.latest_activity_time}>
					<FormattedRelative value={new Date(latest_activity_time)}/>
				</span>
			</div>
		)

		return markup
	}
}

const style = styler
`
	header
		text-align : center

	user_name
		font-size : 32pt
		margin-left : 0.3em

	latest_activity_time
		margin-left : 0.3em
`