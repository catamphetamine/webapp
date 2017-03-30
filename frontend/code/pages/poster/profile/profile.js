import React, { Component, PropTypes } from 'react'
import { Title, preload, redirect }    from 'react-isomorphic-render'
import { connect }                     from 'react-redux'
import { flat as style }               from 'react-styling'
import classNames                      from 'classnames'
import Redux_form                      from 'simpler-redux-form'

import { defineMessages, FormattedMessage } from 'react-intl'
import { Form, Button } from 'react-responsive-ui'

import Clock_icon      from '../../../../assets/images/icons/clock.svg'
import Message_icon    from '../../../../assets/images/icons/message.svg'
import Person_add_icon from '../../../../assets/images/icons/person add.svg'

import Poster_background_pattern_image from '../../../../assets/images/poster background pattern.png'

import
{
	get_users_latest_activity_time,
	get_poster,
	update_poster,
	reset_update_poster_error,
	upload_poster_picture,
	update_poster_picture,
	reset_update_poster_picture_error,
	set_uploaded_poster_picture,
	reset_upload_poster_picture_error,
	set_upload_poster_picture_other_error,
	save_poster_settings,
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

const Default_background_color = '#ffffff'

const Poster_background_pattern =
{
	sizes:
	[{
		width  : 188,
		height : 178,
		file   : Poster_background_pattern_image
	}]
}

@Redux_form
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
		update_poster,
		reset_update_poster_error,
		upload_poster_picture,
		reset_upload_poster_picture_error,
		set_upload_poster_picture_other_error,
		update_poster_picture,
		reset_update_poster_picture_error,
		get_users_latest_activity_time,
		generate_block_poster_token,
		unblock_poster,
		snack,
		redirect,
		set_uploaded_poster_picture
	}
)
@international
export default class Poster_profile extends Component
{
	state = {}

	constructor(props, context)
	{
		super()

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
		const { edit } = this.state

		const
		{
			poster,
			translate,
			style,
			user,
			latest_activity_time,

			update_poster,
			update_poster_info_error,
			update_poster_picture_error,
			upload_poster_picture,
			upload_poster_picture_error,
			upload_poster_picture_other_error,

			update_poster_info_pending,
			upload_poster_picture_pending,
			update_poster_picture_pending,

			set_uploaded_poster_picture,
			set_upload_poster_picture_other_error,

			submit,
			submitting
		}
		= this.props

		const { background_color } = this.state

		const markup =
		(
			<div className="content poster-profile">
				<Title>{ poster.name }</Title>

				<div className="poster-profile__background-picture-container">
					{/* Background picture */}
					<Upload_picture
						changing={ edit }
						changeLabel={ translate(messages.change_background_template) }
						upload={ upload_poster_picture }
						maxSize={ configuration.image_service.file_size_limit }
						onChoose={ this.reset_upload_poster_picture_errors }
						onError={ set_upload_poster_picture_other_error }
						onFinished={ set_uploaded_poster_picture }
						className="poster-profile__background-picture">

						<Picture
							pattern
							picture={ poster.background || Poster_background_pattern }
							type="poster_background_picture"/>
					</Upload_picture>

					{ edit &&
						<div className="poster-profile__background-color">
							{ translate(messages.background_color) }

							<Color_picker
								alignment="right"
								className="poster-profile__background-color-picker"
								value={ background_color || Default_background_color }
								onChange={ this.set_background_color }/>
						</div>
					}

					{/* Poster picture */}
					<Upload_picture
						changing={ edit }
						upload={ upload_poster_picture }
						maxSize={ configuration.image_service.file_size_limit }
						onChoose={ this.reset_upload_poster_picture_errors }
						onError={ set_upload_poster_picture_other_error }
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
				</div>

				{/* Left column */}
				<div className="column-m-6-of-12">

					{/* User's personal info */}
					<section
						style={ styles.personal_info_section }
						className={ classNames
						(
							'background-section',
							{
								'content-section' : edit
							}
						) }>

						{/* User blocked notice */}
						{ poster.blocked_at &&
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
						}

						<Form
							busy={ update_poster_info_pending || update_poster_picture_pending || upload_poster_picture_pending }
							submit={ submit(this.save_profile_edits) }>

							{/* User profile edit errors */}
							{ (update_poster_info_error
								|| update_poster_picture_error
								|| upload_poster_picture_error
								|| upload_poster_picture_other_error)
								&&
								<ul
									style={ styles.own_profile_actions_errors }
									className="content-section__errors content-section__errors--top errors">
									{/* Couldn't update poster's picture with the uploaded one */}
									{ update_poster_picture_error &&
										<li>{ translate(messages.update_error) }</li>
									}

									{/* Couldn't update poster's info */}
									{ update_poster_info_error &&
										<li>{ translate(messages.update_error) }</li>
									}

									{/* Couldn't upload poster's picture */}
									{ upload_poster_picture_error &&
										<li>{ translate(messages.poster_picture_upload_error) }</li>
									}

									{/* User picture file's too big */}
									{ upload_poster_picture_other_error === 'oversized' &&
										<li>{ translate(messages.uploaded_poster_picture_is_too_big_error) }</li>
									}

									{/* User picture file's format is not supported */}
									{ upload_poster_picture_other_error === 'unsupported' &&
										<li>{ translate(messages.unsupported_uploaded_poster_picture_file_error) }</li>
									}

									{/* Other errors */}
									{ upload_poster_picture_other_error === true &&
										<li>{ translate(messages.poster_picture_upload_error) }</li>
									}
								</ul>
							}

							{/* Edit/Save own profile */}
							{ this.can_edit_profile() &&
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
											disabled={ update_poster_info_pending || upload_poster_picture_pending }>
											{ translate(messages.cancel_profile_edits) }
										</Button>
									}

									{/* "Save changes" */}
									{  edit &&
										<Submit
											className="button--primary card__action"
											disabled={ upload_poster_picture_pending }>
											{ translate(messages.save_profile_edits) }
										</Submit>
									}
								</div>
							}

							{/* Block this poster (not self) */}
							{ !this.can_edit_profile() &&
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
							}

							{/* User's personal info (name, place, etc) */}
							<Personal_info
								ref={ ref => this.personal_info = ref }
								edit={ edit }
								poster={ poster }/>
						</Form>

						{/* User actions: "Send message", "Subscribe" */}
						{ !this.can_edit_profile() &&
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
						}

						{/* Online status: "Last seen: an hour ago" */}
						{ latest_activity_time &&
							<div style={ styles.latest_activity } className="poster-profile__last-seen">
								{/* Icon */}
								<Clock_icon className="poster-profile__last-seen-icon"/>
								{/* "an hour ago" */}
								<Time_ago>{ latest_activity_time }</Time_ago>
							</div>
						}
					</section>
				</div>
			</div>
		)

		return markup
	}

	set_background_color = (background_color) =>
	{
		this.setState({ background_color })
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
			poster
		}
		= this.props

		this.reset_poster_info_edit_errors()

		// Clear the temporary uploaded picture
		set_uploaded_poster_picture()

		this.setState((state) =>
		({
			edit : !state.edit,
			background_color : poster.palette.background
		}))
	}

	async save_profile_edits(values)
	{
		const
		{
			poster,
			uploaded_picture,
			update_poster_picture,
			update_poster,
			set_uploaded_poster_picture
		}
		= this.props

		const
		{
			background_color
		}
		= this.state

		try
		{
			// Reset errors before submit
			this.reset_poster_info_edit_errors()

			// Save the uploaded poster picture (if it was uploaded)
			if (uploaded_picture)
			{
				await update_poster_picture(poster.id, uploaded_picture)
			}

			// Collect poster info edits
			const poster_info = Personal_info.get_values(this.personal_info, values)

			// Include the updated background color
			if (background_color)
			{
				poster_info.palette =
				{
					...poster.palette,
					background: background_color
				}
			}

			// Save poster info edits
			await update_poster(poster_info)

			// Exit "edit" mode
			this.toggle_edit_mode()
		}
		catch (error)
		{
			console.error(error)
		}
	}

	reset_poster_info_edit_errors = () =>
	{
		const
		{
			reset_update_poster_error,
			reset_update_poster_picture_error
		}
		= this.props

		reset_update_poster_error()
		reset_update_poster_picture_error()

		this.reset_upload_poster_picture_errors()
	}

	reset_upload_poster_picture_errors = () =>
	{
		const
		{
			reset_upload_poster_picture_error,
			set_upload_poster_picture_other_error
		}
		= this.props

		reset_upload_poster_picture_error()
		set_upload_poster_picture_other_error()
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
	personal_info_section
		position : relative

	poster_name
		font-size     : 1.5rem
		margin-bottom : 0

	latest_activity
		cursor : default
`

const messages = defineMessages
({
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
	poster_unblocked:
	{
		id             : `poster.profile.unblocked`,
		description    : `A note that the user has been unblocked`,
		defaultMessage : `User unblocked`
	},
	update_error:
	{
		id             : `poster.profile.update_error`,
		description    : `Failed to update user's own profile`,
		defaultMessage : `Couldn't update your profile`
	},
	poster_picture_upload_error:
	{
		id             : `poster.profile.user_picture_upload_error`,
		description    : `Failed to upload user picture`,
		defaultMessage : `Couldn't process the picture`
	},
	uploaded_poster_picture_is_too_big_error:
	{
		id             : `poster.profile.uploaded_user_picture_is_too_big_error`,
		description    : `The image user tried to upload is too big`,
		defaultMessage : `The image file you tried to upload is too big. Only images up to 10 Megabytes are allowed.`
	},
	unsupported_uploaded_poster_picture_file_error:
	{
		id             : `poster.profile.unsupported_uploaded_user_picture_file_error`,
		description    : `The image user tried to upload is of an unsupported file format`,
		defaultMessage : `The file you tried to upload is not supported for user pictures. Only JPG, PNG and SVG images are supported.`
	},
	name_is_required:
	{
		id             : `poster.profile.name_is_required`,
		description    : `The user tried to save his profile with a blank "name" field`,
		defaultMessage : `Enter your name`
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
	change_background_template:
	{
		id             : `poster.profile.background_template.change`,
		description    : `A text on background pattern overlay in edit mode`,
		defaultMessage : `Change background pattern`
	},
	change_banner:
	{
		id             : `poster.profile.banner.change`,
		description    : `A text on banner overlay in edit mode`,
		defaultMessage : `Change banner`
	},
	background_color:
	{
		id             : `poster.profile.background_color`,
		description    : `Profile background color label`,
		defaultMessage : `Color`
	}
})