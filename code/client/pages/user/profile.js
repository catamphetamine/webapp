import React, { Component, PropTypes } from 'react'
import { title }                       from 'react-isomorphic-render'
import { preload }                     from 'react-isomorphic-render/redux'
import { connect }                     from 'react-redux'
import styler                          from 'react-styling'
import React_time_ago                  from 'react-time-ago'

import { defineMessages, FormattedRelative }          from 'react-intl'

import { bindActionCreators as bind_action_creators } from 'redux'

import { get_user, get_users_latest_activity_time }  from '../../actions/users'

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
		const { user, translate } = this.props

		const user_picture = user.picture ? `/upload/user_pictures/${user.id}.jpg` : require('../../../../assets/images/no user picture.png')

		const markup = 
		(
			<section className="content  user-profile">
				{title(user.name)}

				{/* Avatar */}
				<img className="user-picture  user-picture--profile  card" src={user_picture}/>

				<h1 style={style.user_name}>{user.name}</h1>

				{ user.city && user.country && (
					<div style={style.user_origin} className="user-profile__origin">
						{user.city + ', ' + translate({ id: `country.${user.country}` })}
					</div>
				)}

				{this.render_latest_activity_time()}
			</section>
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
}

const style = styler
`
	picture
		border: 1px solid #E1E3DF

	header
		text-align : center

	user_name
		font-size : 1.5rem
		margin-bottom : 0em

	user_origin
		margin-top : 0.1em

	latest_activity
		margin-top : 1.2rem
		opacity    : 0.5

	latest_activity_time
`