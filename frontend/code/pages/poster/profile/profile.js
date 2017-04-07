import React, { Component, PropTypes } from 'react'
import { Title, Link, preload, redirect } from 'react-isomorphic-render'
import { connect }                     from 'react-redux'
import { withRouter }                  from 'react-router'
import { flat as style }               from 'react-styling'
import classNames                      from 'classnames'
import Redux_form                      from 'simpler-redux-form'

import { defineMessages, FormattedMessage } from 'react-intl'
import { Form, Button, Checkbox } from 'react-responsive-ui'

import Clock_icon      from '../../../../assets/images/icons/clock.svg'
import Message_icon    from '../../../../assets/images/icons/message.svg'
import Person_add_icon from '../../../../assets/images/icons/person add.svg'

import Default_poster_background_pattern_image from '../../../../assets/images/poster background pattern.png'

import
{
	get_users_latest_activity_time,
	get_poster,

	update_poster,
	reset_update_poster_error,

	update_poster_picture,
	reset_update_poster_picture_error,

	update_poster_background_pattern,
	reset_update_poster_background_pattern_error,

	update_poster_banner,
	reset_update_poster_banner_error,

	set_uploaded_poster_picture,
	set_uploaded_poster_background_pattern,
	set_uploaded_poster_banner,

	upload_picture,
	set_upload_picture_error,

	connector
}
from '../../../redux/poster/profile'

import
{
	generate_block_poster_token,
	unblock_poster
}
from '../../../redux/poster/block'

import { snack } from '../../../redux/snackbar'

import Personal_info from './personal info'

import Submit         from '../../../components/form/submit'
import Poster         from '../../../components/poster'
import Poster_picture from '../../../components/poster picture'
import Upload_picture, { Picture } from '../../../components/upload picture'
import Time_ago       from '../../../components/time ago'
import Color_picker   from '../../../components/color picker'

import default_messages from '../../../components/messages'

import can from '../../../../../code/permissions'

import international from '../../../international/internationalize'

const Latest_activity_time_refresh_interval = 60 * 1000 // once in a minute

const Online_status_time_span = 5 * 60 * 1000 // 5 minutes

const Default_background_color = '#ffffff'

const Default_poster_background_pattern =
{
	sizes:
	[{
		width  : 188,
		height : 178,
		file   : Default_poster_background_pattern_image
	}]
}

@Redux_form
@withRouter
@preload(({ dispatch, getState, location, parameters }) =>
{
	return dispatch(get_poster(parameters.id))
})
@connect
(
	({ authentication, poster_profile, locale }) =>
	({
		...connector(poster_profile),
		user   : authentication.user,
		locale : locale.locale
	}),
	{
		get_poster,
		get_users_latest_activity_time,

		update_poster,
		reset_update_poster_error,

		update_poster_picture,
		reset_update_poster_picture_error,

		update_poster_background_pattern,
		reset_update_poster_background_pattern_error,

		update_poster_banner,
		reset_update_poster_banner_error,

		upload_picture,
		set_upload_picture_error,

		set_uploaded_poster_picture,
		set_uploaded_poster_background_pattern,
		set_uploaded_poster_banner,

		generate_block_poster_token,
		unblock_poster,

		snack,
		redirect
	}
)
@international
export default class Poster_profile extends Component
{
	state = {}

	constructor(props)
	{
		super(props)

		const { poster } = this.props

		// Same as in `.toggle_edit_mode()`
		this.state.background_color         = poster.palette.background
		this.state.background_color_enabled = poster.palette.background !== undefined
		// Is `null` instead of `undefined` in knex.js
		this.state.banner_enabled           = exists(poster.banner)

		this.save_profile_edits   = this.save_profile_edits.bind(this)

		this.block_poster         = this.block_poster.bind(this)
		this.unblock_poster       = this.unblock_poster.bind(this)

		this.send_message = this.send_message.bind(this)
		this.subscribe    = this.subscribe.bind(this)
	}

	componentDidMount()
	{
		const { poster, get_users_latest_activity_time } = this.props

		// If this is a user's poster then also show "was online" time
		if (poster.user)
		{
			get_users_latest_activity_time(poster.user)

			// Refresh this user's latest activity time periodically.
			// Do it in a timeout because `react-time-ago` also
			// refreshes the time label once a minute,
			// therefore to eliminate jitter due to the race condition
			// a delay of half a minute is imposed.
			setTimeout(() =>
			{
				this.latest_activity_time_refresh = setInterval(() =>
				{
					get_users_latest_activity_time(poster.user)
				},
				Latest_activity_time_refresh_interval)
			},
			30 * 1000)
		}
	}

	componentWillReceiveProps(new_props)
	{
		const { upload_picture_error, translate, snack } = new_props

		if (upload_picture_error && upload_picture_error !== this.props.upload_picture_error)
		{
			switch (upload_picture_error)
			{
				// The picture file's too big
				case 'oversized':
					return snack(translate(default_messages.picture_upload_too_big_error), 'error')

				// The picture file's format is not supported
				case 'unsupported':
					return snack(translate(default_messages.picture_upload_unsupported_file_error), 'error')

				// Other errors
				default:
					return snack(translate(default_messages.picture_upload_error), 'error')
			}
		}
	}

	componentWillUnmount()
	{
		// Stop refreshing this user's latest activity time
		if (this.latest_activity_time_refresh)
		{
			clearInterval(this.latest_activity_time_refresh)
		}
	}

	render()
	{
		const
		{
			poster,
			user,
			translate,
			style,

			upload_picture,
			upload_picture_pending,

			set_uploaded_poster_picture,
			set_uploaded_poster_background_pattern,
			set_uploaded_poster_banner,

			set_upload_picture_error,

			uploaded_banner,

			submit,
			submitting,

			router,
			children
		}
		= this.props

		const
		{
			background_color,
			background_color_enabled,
			banner_enabled,
			edit
		}
		= this.state

		const poster_form_busy = submitting || upload_picture_pending

		const banner_shown_while_editing = uploaded_banner || (background_color_enabled && poster.banner)
		const show_banner_while_editing = banner_enabled && banner_shown_while_editing

		let wide_content = false
		let main_page    = false

		console.log('@@@@@@ router', router)

		const change_background_pattern_label =
		(
			<div>
				{/* "Change background pattern" */}
				<span className="poster-profile__change-background-pattern-label--long">
					{ translate(messages.change_background_pattern) }
				</span>

				{/* "Change background" */}
				<span className="poster-profile__change-background-pattern-label--short">
					{ translate(messages.change_background_pattern_short) }
				</span>
			</div>
		)

		const markup =
		(
			<div
				className={ classNames('content', 'poster-profile',
				{
					'poster-profile--editing'      : edit,
					'poster-profile--wide-content' : wide_content
				}) }>

				<Title>{ poster.name }</Title>

				<div className="poster-profile__background-picture-container">

					{/* Banner */}
					{ !edit && poster.banner &&
						<Picture
							frameless
							picture={ poster.banner }
							className="poster-profile__banner"/>
					}

					{/* Uploaded banner */}
					{ edit && show_banner_while_editing &&
						<Picture
							frameless
							type={ uploaded_banner ? 'uploaded' : undefined }
							picture={ banner_shown_while_editing }
							className="poster-profile__banner"/>
					}

					{/* "Change banner" */}
					{ edit &&
						<Upload_picture
							type="poster_banner"
							changing={ edit }
							changeLabel=""
							disabled={ submitting }
							upload={ upload_picture }
							onChoose={ set_upload_picture_error }
							onError={ set_upload_picture_error }
							onFinished={ this.banner_uploaded }
							className="poster-profile__change-banner">

							{/* Banner toggler */}
							<Checkbox
								value={ banner_enabled }
								onChange={ this.set_banner_enabled }
								className={ classNames('poster-profile__banner-toggler',
								{
									'poster-profile__banner-toggler--off' : !banner_enabled
								}) }/>

							{/* "Change banner" */}
							<span className="poster-profile__change-banner-label--long">
								{ translate(messages.change_banner) }
							</span>

							{/* "Banner" */}
							<span className="poster-profile__change-banner-label--short">
								{ translate(messages.change_banner_short) }
							</span>
						</Upload_picture>
					}

					{/* Poster background pattern picture */}
					<Upload_picture
						type="poster_background_pattern"
						changing={ edit }
						changeLabel={ show_banner_while_editing ? '' : change_background_pattern_label }
						disabled={ submitting }
						upload={ upload_picture }
						onChoose={ set_upload_picture_error }
						onError={ set_upload_picture_error }
						onFinished={ set_uploaded_poster_background_pattern }
						className={ classNames('poster-profile__background-picture',
						{
							'poster-profile__background-picture--color' : background_color_enabled
						}) }
						style={ { backgroundColor: background_color } }>

						<Picture
							pattern
							frameless
							type={ poster.background_pattern ? undefined : 'asset'}
							picture={ poster.background_pattern }
							fallback={ background_color_enabled ? undefined : Default_poster_background_pattern }/>
					</Upload_picture>

					{/* Background color */}
					{ edit &&
						<div className="poster-profile__background-color">
							{/* Enable/disable background color */}
							<Checkbox
								value={ background_color_enabled }
								onChange={ this.set_background_color_enabled }
								className="poster-profile__background-color-toggler"/>

							{/* "Choose background color" */}
							{ translate(messages.background_color) }

							<Color_picker
								alignment="right"
								className="poster-profile__background-color-picker"
								value={ background_color || Default_background_color }
								onChange={ this.set_background_color }/>
						</div>
					}

					{/* Poster picture */}
					{ !wide_content &&
						<Upload_picture
							type="poster_picture"
							changing={ edit }
							disabled={ submitting }
							upload={ upload_picture }
							onChoose={ set_upload_picture_error }
							onError={ set_upload_picture_error }
							onFinished={ set_uploaded_poster_picture }
							className={ classNames
							(
								'poster-profile__picture',
								'card'
							) }>

							<Poster_picture
								poster={ poster }
								className="poster-profile__picture-image"/>
						</Upload_picture>
					}

					{ wide_content &&
						<Link
							to={ Poster.url(poster) }
							className={ classNames
							(
								'poster-profile__picture',
								'card'
							) }>
							<Poster_picture
								poster={ poster }
								className="poster-profile__picture-image"/>
						</Link>
					}

					{ wide_content &&
						<div className="poster-profile__short-info">
							<Link
								to={ Poster.url(poster) }
								className="poster-profile__short-info-name">
								{ poster.name }
							</Link>
						</div>
					}
				</div>

				{/* Poster info */}
				<div className="poster-profile__body content-sections">
					{ !wide_content &&
						<div
							style={ styles.personal_info_column }
							className="poster-profile__info">

							{/* Poster's personal info */}
							<section
								className={ classNames
								({
									'background-section' : !edit,
									'content-section'    : edit
								}) }>

								{/* Poster blocked notice */}
								{ poster.blocked_at && this.render_poster_blocked_notice() }

								<Form
									busy={ poster_form_busy }
									submit={ submit(this.save_profile_edits) }>

									{/* Poster profile edit errors */}
									{ this.render_poster_edit_errors() }

									{/* Edit/Save own profile */}
									{ this.can_edit_profile() && this.render_edit_actions(poster_form_busy) }

									{/* Block this poster (not self) */}
									{ !this.can_edit_profile() && this.render_moderator_actions() }

									{/* User's personal info (name, place, etc) */}
									<Personal_info
										ref={ ref => this.personal_info = ref }
										edit={ edit }
										poster={ poster }/>
								</Form>

								{/* Other poster actions: "Send message", "Subscribe" */}
								{ !this.can_edit_profile() && this.render_other_poster_actions() }

								{/* User online status: "Last seen: an hour ago" */}
								{ this.render_online_status() }
							</section>
						</div>
					}

					<div className="poster-profile__content">
						{/* Tabs */}
						<div className="poster-profile__tabs-container">
							<ul className="poster-profile__tabs">
								<li
									className={ classNames('poster-profile__tab',
									{
										'poster-profile__tab--selected' : true
									}) }>
									<Link
										to={`${Poster.url(poster)}`}
										className="poster-profile__tab-button">
										{ translate(messages.posts) }
									</Link>
								</li>
								<li className="poster-profile__tab">
									<Link
										to={`${Poster.url(poster)}/subscriptions`}
										className="poster-profile__tab-button">
										{ translate(messages.subscriptions) }
									</Link>
								</li>
							</ul>
						</div>

						{/* Page content */}
						{ children }
					</div>

					<div className="poster-profile__right-aside">
					</div>
				</div>
			</div>
		)

		return markup
	}

	render_poster_blocked_notice()
	{
		const
		{
			poster,
			user
		}
		= this.props

		const markup =
		(
			<div className="content-section__errors content-section__errors--top">
				{ poster.blocked_by.id === user.id
					?
					<FormattedMessage
						{ ...messages.blocked }
						values=
						{ {
							blocked_at : <Time_ago>{ poster.blocked_at }</Time_ago>
						} }/>
					:
					<FormattedMessage
						{ ...messages.blocked_detailed }
						values=
						{ {
							blocked_at     : <Time_ago>{ poster.blocked_at }</Time_ago>,
							blocked_by     : <Poster>{ poster.blocked_by.poster }</Poster>,
							blocked_reason : poster.blocked_reason
						} }/>
				}
			</div>
		)

		return markup
	}

	render_poster_edit_errors()
	{
		const
		{
			update_poster_error,
			update_poster_picture_error,
			update_poster_background_pattern_error,
			update_poster_banner_error,
			translate
		}
		= this.props

		if (update_poster_error ||
			update_poster_picture_error ||
			update_poster_background_pattern_error ||
			update_poster_banner_error)
		{
			const markup =
			(
				<ul
					style={ styles.own_profile_actions_errors }
					className="content-section__errors content-section__errors--top errors">

					{/* Couldn't update poster's info */}
					{ update_poster_error &&
						<li>{ translate(messages.update_error) }</li>
					}

					{/* Couldn't update poster's picture with the uploaded one */}
					{ update_poster_picture_error &&
						<li>{ translate(messages.update_picture_error) }</li>
					}

					{/* Couldn't update poster's background pattern */}
					{ update_poster_background_pattern_error &&
						<li>{ translate(messages.update_background_pattern_error) }</li>
					}

					{/* Couldn't update poster's banner */}
					{ update_poster_banner_error &&
						<li>{ translate(messages.update_banner_error) }</li>
					}
				</ul>
			)

			return markup
		}
	}

	render_online_status()
	{
		const
		{
			latest_activity_time,
			translate
		}
		= this.props

		if (!latest_activity_time)
		{
			return
		}

		let latest_activity_time_was

		if (Date.now() - latest_activity_time.getTime() < Online_status_time_span)
		{
			latest_activity_time_was = translate(messages.online)
		}
		else
		{
			// "an hour ago"
			latest_activity_time_was = <Time_ago tick={ false }>{ latest_activity_time }</Time_ago>
		}

		const markup =
		(
			<div style={ styles.latest_activity } className="poster-profile__last-seen">
				{/* Icon */}
				<Clock_icon className="poster-profile__last-seen-icon"/>
				{/* "an hour ago" */}
				{ latest_activity_time_was }
			</div>
		)

		return markup
	}

	render_other_poster_actions()
	{
		const { translate } = this.props

		const markup =
		(
			<div className="poster-profile__actions">
				{/* "Subscribe" */}
				<div>
					<Button
						action={ this.subscribe }
						className="poster-profile__action">
						{/* Icon */}
						<Person_add_icon className="poster-profile__action-icon"/>
						{/* Text */}
						{ translate(messages.subscribe) }
					</Button>
				</div>

				{/* "Send message" */}
				<div>
					<Button
						action={ this.send_message }
						className="poster-profile__action">
						{/* Icon */}
						<Message_icon className="poster-profile__action-icon"/>
						{/* Text */}
						{ translate(messages.send_message) }
					</Button>
				</div>
			</div>
		)

		return markup
	}

	render_edit_actions(poster_form_busy)
	{
		const { translate } = this.props
		const { edit } = this.state

		const markup =
		(
			<div
				style={ styles.own_profile_actions }
				className="poster-profile__edit-actions card__actions">

				{/* "Edit profile" */}
				{ !edit &&
					<Button
						className="card__action"
						action={ this.toggle_edit_mode }>
						{ translate(messages.edit_profile) }
					</Button>
				}

				{/* "Settings" */}
				{ false && !edit &&
					<Button
						className="card__action"
						action={ this.show_profile_settings }>
						{ translate(default_messages.settings) }
					</Button>
				}

				{/* "Cancel changes" */}
				{  edit &&
					<Button
						action={ this.toggle_edit_mode }
						className="card__action"
						disabled={ poster_form_busy }>
						{ translate(messages.cancel_profile_edits) }
					</Button>
				}

				{/* "Save changes" */}
				{  edit &&
					<Submit
						className="button--primary card__action"
						disabled={ poster_form_busy }>
						{ translate(messages.save_profile_edits) }
					</Submit>
				}
			</div>
		)

		return markup
	}

	render_moderator_actions()
	{
		const { poster, user, translate } = this.props

		const markup =
		(
			<div
				style={ styles.own_profile_actions }
				className="poster-profile__edit-actions card__actions">

				{/* "Block poster" */}
				{ !poster.blocked_at && can('block poster', user) &&
					<Button
						className="card__action"
						action={ this.block_poster }>
						{ translate(messages.block_poster) }
					</Button>
				}

				{/* "Unblock poster" */}
				{ poster.blocked_at && can('unblock user', user) &&
					<Button
						className="card__action"
						action={ this.unblock_poster }>
						{ translate(messages.unblock_poster) }
					</Button>
				}
			</div>
		)

		return markup
	}

	set_banner_enabled = (value) =>
	{
		this.setState
		({
			banner_enabled : value
		})
	}

	set_background_color_enabled = (value) =>
	{
		this.setState
		({
			background_color_enabled : value
		})
	}

	set_background_color = (background_color) =>
	{
		this.setState
		({
			background_color,
			background_color_enabled : true
		})
	}

	banner_uploaded = (banner) =>
	{
		const { set_uploaded_poster_banner } = this.props

		this.setState({ banner_enabled: true })
		set_uploaded_poster_banner(banner)
	}

	can_edit_profile()
	{
		const { user, poster } = this.props

		return user && (poster.user === user.id || poster.users.has(user.id))
	}

	toggle_edit_mode = () =>
	{
		const
		{
			set_uploaded_poster_picture,
			poster,
			reset
		}
		= this.props

		this.reset_poster_edit_errors()

		// Clear the temporary uploaded picture
		set_uploaded_poster_picture()

		// Reset the form
		reset()

		this.setState((state) =>
		({
			edit : !state.edit,

			// Same as in `constructor()`
			background_color         : poster.palette.background,
			background_color_enabled : poster.palette.background !== undefined,
			// Is `null` instead of `undefined` in knex.js
			banner_enabled           : exists(poster.banner)
		}))
	}

	async save_profile_edits(values)
	{
		const
		{
			poster,

			uploaded_poster_picture,
			uploaded_background_pattern,
			uploaded_banner,

			update_poster,
			update_poster_picture,
			update_poster_background_pattern,
			update_poster_banner
		}
		= this.props

		const
		{
			background_color,
			background_color_enabled,
			banner_enabled
		}
		= this.state

		try
		{
			// Reset errors before submit
			this.reset_poster_edit_errors()

			// Save the uploaded poster picture (if it was uploaded)
			if (uploaded_poster_picture)
			{
				await update_poster_picture(poster.id, uploaded_poster_picture)
			}

			// Save the uploaded poster background pattern (if it was uploaded)
			if (uploaded_background_pattern)
			{
				await update_poster_background_pattern(poster.id, uploaded_background_pattern)
			}

			// Save the uploaded poster banner (if it was uploaded)
			if (uploaded_banner)
			{
				await update_poster_banner(poster.id, uploaded_banner)
			}

			// Collect poster info edits
			const poster_info = Personal_info.get_values(this.personal_info, values)

			// If the banner was turned off then reset it on server
			if (!banner_enabled)
			{
				poster_info.banner = false
			}

			// The palette may have been updated so send it too
			poster_info.palette = { ...poster.palette }

			// Save background color (if set)
			if (background_color)
			{
				// Maybe background color was turned off
				if (background_color_enabled)
				{
					poster_info.palette.background = background_color
				}
				else
				{
					delete poster_info.palette.background
				}
			}

			// Save poster info edits
			await update_poster(poster.id, poster_info)

			// Exit "edit" mode
			this.toggle_edit_mode()
		}
		catch (error)
		{
			console.error(error)
		}
	}

	reset_poster_edit_errors = () =>
	{
		const
		{
			reset_update_poster_error,
			reset_update_poster_picture_error,
			reset_update_poster_background_pattern_error,
			reset_update_poster_banner_error,
			set_upload_picture_error
		}
		= this.props

		reset_update_poster_error()
		reset_update_poster_picture_error()
		reset_update_poster_background_pattern_error()
		reset_update_poster_banner_error()
		set_upload_picture_error()
	}

	async block_poster()
	{
		const { poster, get_poster, generate_block_poster_token, redirect } = this.props

		const token_id = await generate_block_poster_token(poster.id)

		// Update `blocked_at`, etc
		await get_poster(poster.id)

		redirect(`/${poster.id}/block/${token_id}`)
	}

	async unblock_poster()
	{
		const { poster, get_poster, unblock_poster, translate, snack } = this.props

		await unblock_poster(poster.id)

		await get_poster(poster.id)

		snack(translate(messages.poster_unblocked))
	}

	send_message()
	{
		const { poster } = this.props
	}

	subscribe()
	{
		const { poster } = this.props
	}
}

const styles = style
`
	personal_info_column
		position : relative

	poster_name
		font-size     : 1.5rem
		margin-bottom : 0

	latest_activity
		cursor : default
`

const messages = defineMessages
({
	posts:
	{
		id             : `poster.profile.tabs.posts`,
		description    : `Poster profile posts tab title`,
		defaultMessage : `Posts`
	},
	subscriptions:
	{
		id             : `poster.profile.tabs.subscriptions`,
		description    : `Poster profile subscriptions tab title`,
		defaultMessage : `Subscriptions`
	},
	merchandise:
	{
		id             : `poster.profile.tabs.merchandise`,
		description    : `Poster profile merchandise tab title`,
		defaultMessage : `Merchandise`
	},
	reviews:
	{
		id             : `poster.profile.tabs.reviews`,
		description    : `Poster profile reviews tab title`,
		defaultMessage : `Reviews`
	},
	online:
	{
		id             : `poster.profile.latest_activity_time.online`,
		description    : `The poster is currently online`,
		defaultMessage : `Online`
	},
	latest_activity_time:
	{
		id             : `poster.profile.latest_activity_time`,
		description    : `This user's most recent activity time`,
		defaultMessage : `{gender, select,
							male   {Last seen}
							female {Last seen}
							other  {Last seen}}`
	},
	edit_profile:
	{
		id             : `poster.profile.edit`,
		description    : `Edit user's own profile action`,
		defaultMessage : `Edit`
	},
	cancel_profile_edits:
	{
		id             : `poster.profile.cancel_editing`,
		description    : `Cancel user's own profile edits`,
		defaultMessage : `Cancel`
	},
	save_profile_edits:
	{
		id             : `poster.profile.save`,
		description    : `Save user's own profile edits`,
		defaultMessage : `Save`
	},
	send_message:
	{
		id             : `poster.profile.send_message`,
		description    : `An action label to contact the user`,
		defaultMessage : `Contact`
	},
	subscribe:
	{
		id             : `poster.profile.subscribe`,
		description    : `An action label to subscribe to this user's activity updates`,
		defaultMessage : `Subscribe`
	},
	blocked:
	{
		id             : `poster.profile.blocked`,
		description    : `A note that the user is temporarily blocked`,
		defaultMessage : `This user was temporarily blocked {blocked_at}`
	},
	blocked_detailed:
	{
		id             : `poster.profile.blocked_detailed`,
		description    : `A detailed note that the user is blocked`,
		defaultMessage : `This user was blocked {blocked_at} by {blocked_by} with reason: "{blocked_reason}"`
	},
	block_poster:
	{
		id             : `poster.profile.block`,
		description    : `An action to block this user`,
		defaultMessage : `Block`
	},
	unblock_poster:
	{
		id             : `poster.profile.unblock`,
		description    : `An action to unblock this user`,
		defaultMessage : `Unblock`
	},
	poster_unblocked:
	{
		id             : `poster.profile.unblocked`,
		description    : `A note that the user has been unblocked`,
		defaultMessage : `User unblocked`
	},
	update_error:
	{
		id             : `poster.profile.update.error`,
		description    : `Failed to update user's own profile`,
		defaultMessage : `Couldn't update your profile`
	},
	change_background_pattern:
	{
		id             : `poster.profile.background_pattern.change`,
		description    : `A text on background pattern overlay in edit mode`,
		defaultMessage : `Change background pattern`
	},
	change_background_pattern_short:
	{
		id             : `poster.profile.background_pattern.change.short`,
		description    : `A (short) text on background pattern overlay in edit mode`,
		defaultMessage : `Change background`
	},
	change_banner:
	{
		id             : `poster.profile.banner.change`,
		description    : `A text on banner overlay in edit mode`,
		defaultMessage : `Change banner`
	},
	change_banner_short:
	{
		id             : `poster.profile.banner.change.short`,
		description    : `A (short) text on banner overlay in edit mode`,
		defaultMessage : `Banner`
	},
	update_picture_error:
	{
		id             : `poster.profile.picture.update.error`,
		description    : `Failed to update poster's own picture`,
		defaultMessage : `Couldn't update your picture`
	},
	update_background_pattern_error:
	{
		id             : `poster.profile.background_pattern.update.error`,
		description    : `Failed to update poster's own background pattern`,
		defaultMessage : `Couldn't update your background pattern`
	},
	update_banner_error:
	{
		id             : `poster.profile.banner.update.error`,
		description    : `Failed to update poster's own banner`,
		defaultMessage : `Couldn't update your banner`
	},
	background_color:
	{
		id             : `poster.profile.background_color`,
		description    : `Profile background color label`,
		defaultMessage : `Color`
	}
})