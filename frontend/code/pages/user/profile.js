import React, { Component, PropTypes } from 'react'
import { Title, preload, redirect }    from 'react-isomorphic-render'
import { connect }                     from 'react-redux'
import { flat as style }               from 'react-styling'
import classNames                      from 'classnames'
import Redux_form                      from 'simpler-redux-form'

import { defineMessages, FormattedMessage } from 'react-intl'
import { bindActionCreators as bind_action_creators } from 'redux'
import { Form, Button, FileUpload, ActivityIndicator, File, CanDrop } from 'react-responsive-ui'

import
{
	get_users_latest_activity_time,
	get_user,
	update_user,
	update_user_reset_error,
	upload_user_picture,
	update_user_picture,
	connector
}
from '../../redux/user/profile'

import
{
	generate_block_user_token,
	unblock_user
}
from '../../redux/user/block'

import Text_input   from '../../components/form/text input'
import Submit       from '../../components/form/submit'
import Select       from '../../components/form/select'

import User         from '../../components/user'
import User_picture from '../../components/user picture'
import Time_ago     from '../../components/time ago'

import { get_preferred_size, url } from '../../components/image'

import can from '../../../../code/permissions'

import international from '../../international/internationalize'

const Latest_activity_time_refresh_interval = 60 * 1000 // once in a minute

@Redux_form
@preload(({ dispatch, getState, location, parameters }) =>
{
	return Promise.all
	([
		dispatch(get_user(parameters.id)),
		dispatch(get_users_latest_activity_time(parameters.id))
	])
})
@connect
(
	(state) =>
	({
		current_user: state.authentication.user,
		...connector(state.user_profile),
		locale : state.locale.locale
	}),
	dispatch =>
	({
		dispatch,
		...bind_action_creators
		({
			get_user,
			update_user,
			update_user_reset_error,
			upload_user_picture,
			update_user_picture,
			get_users_latest_activity_time,
			generate_block_user_token,
			unblock_user
		},
		dispatch)
	})
)
@international
export default class User_profile extends Component
{
	state = {}

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

		this.validate_name        = this.validate_name.bind(this)

		this.block_user           = this.block_user.bind(this)
		this.unblock_user         = this.unblock_user.bind(this)

		this.send_message = this.send_message.bind(this)
		this.subscribe    = this.subscribe.bind(this)

		this.upload_user_picture = this.upload_user_picture.bind(this)
		this.reset_upload_user_picture_errors = this.reset_upload_user_picture_errors.bind(this)

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
			.sort((a, b) => a.label.localeCompare(b.label, props.locale))
	}

	componentDidMount()
	{
		const { user, get_users_latest_activity_time } = this.props

		// Refresh this user's latest activity time periodically.
		// Do it in a timeout because `react-time-ago` also
		// refreshes the time label once a minute,
		// therefore to eliminate jitter due to the race condition
		// a delay of half a minute is imposed.
		setTimeout(() =>
		{
			this.latest_activity_time_refresh = setInterval(() =>
			{
				get_users_latest_activity_time(user.id)
			},
			Latest_activity_time_refresh_interval)
		},
		30 * 1000)
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
			user,
			translate,
			style,
			current_user,
			latest_activity_time,
			uploaded_picture,

			update_user_info_error,
			update_user_picture_error,
			upload_user_picture_error,
			uploaded_user_picture_is_too_big_error,
			unsupported_uploaded_user_picture_file_error,

			update_user_info_pending,
			upload_user_picture_pending,
			update_user_picture_pending,

			submit
		}
		= this.props

		const is_own_profile = current_user && current_user.id === user.id

		const markup =
		(
			<div className="content user-profile">
				<Title>{ user.name }</Title>

				{/* Left column */}
				<div className="column-m-6-of-12">

					{/* User's personal info */}
					<section
						className={classNames
						(
							'content-section',
							'user-profile__personal-info'
						)}>

						{/* User blocked notice */}
						{ user.blocked_at &&
							<div className="content-section__errors content-section__errors--top">
								{ user.blocked_by.id === user.id
									?
									<FormattedMessage
										{...messages.blocked}
										values=
										{{
											blocked_at : <Time_ago>{user.blocked_at}</Time_ago>
										}}/>
									:
									<FormattedMessage
										{...messages.blocked_detailed}
										values=
										{{
											blocked_at     : <Time_ago>{user.blocked_at}</Time_ago>,
											blocked_by     : <User>{user.blocked_by}</User>,
											blocked_reason : user.blocked_reason
										}}/>
								}
							</div>
						}

						{/* User profile edit errors */}
						{ (update_user_info_error
							|| update_user_picture_error
							|| upload_user_picture_error
							|| uploaded_user_picture_is_too_big_error
							|| unsupported_uploaded_user_picture_file_error)
							&&
							<ul
								style={ styles.own_profile_actions_errors }
								className="content-section__errors content-section__errors--top errors">
								{/* Couldn't update user's picture with the uploaded one */}
								{ update_user_picture_error &&
									<li>{ translate(messages.update_error) }</li>
								}

								{/* Couldn't update user info */}
								{ update_user_info_error &&
									<li>{ translate(messages.update_error) }</li>
								}

								{/* Couldn't upload user picture */}
								{ upload_user_picture_error &&
									<li>{ translate(messages.user_picture_upload_error) }</li>
								}

								{/* User picture file's too big */}
								{ uploaded_user_picture_is_too_big_error &&
									<li>{ translate(messages.uploaded_user_picture_is_too_big_error) }</li>
								}

								{/* User picture file's format is not supported */}
								{ unsupported_uploaded_user_picture_file_error &&
									<li>{ translate(messages.unsupported_uploaded_user_picture_file_error) }</li>
								}
							</ul>
						}

						<Form
							busy={ update_user_info_pending || update_user_picture_pending || upload_user_picture_pending }
							action={ submit(this.save_profile_edits) }>

							{/* Edit/Save own profile */}
							{ is_own_profile &&
								<div style={styles.own_profile_actions} className="card__actions">

									{/* "Edit profile" */}
									{ !edit &&
										<Button
											className="card__action"
											action={this.edit_profile}>
											{translate(messages.edit_profile)}
										</Button>
									}

									{/* "Cancel changes" */}
									{  edit &&
										<Button
											action={this.cancel_profile_edits}
											className="card__action"
											disabled={update_user_info_pending || upload_user_picture_pending}>
											{translate(messages.cancel_profile_edits)}
										</Button>
									}

									{/* "Save changes" */}
									{  edit &&
										<Submit
											className="button--primary card__action"
											disabled={upload_user_picture_pending}>
											{translate(messages.save_profile_edits)}
										</Submit>
									}
								</div>
							}

							{/* Block this other user */}
							{ !is_own_profile &&
								<div style={styles.own_profile_actions} className="card__actions">

									{/* "Block user" */}
									{ !user.blocked_at && can('block user', current_user) &&
										<Button
											className="card__action"
											action={this.block_user}>
											{translate(messages.block_user)}
										</Button>
									}

									{/* "Unblock user" */}
									{ user.blocked_at && can('unblock user', current_user) &&
										<Button
											className="card__action"
											action={this.unblock_user}>
											{translate(messages.unblock_user)}
										</Button>
									}
								</div>
							}

							{/* User picture */}
							<Uploadable_user_picture
								ref={ref => this.user_picture = ref}
								edit={edit}
								user={user}
								uploaded_picture={uploaded_picture}
								uploading_picture={upload_user_picture_pending}
								upload_user_picture={this.upload_user_picture}
								choosing_user_picture={this.reset_upload_user_picture_errors}
								translate={translate}
								style={style}/>

							{ edit &&
								<div className="rrui__form__fields">
									{/* Edit user's name */}
									<Text_input
										name="name"
										label={translate(messages.name)}
										value={user.name}
										validate={this.validate_name}/>

									{/* Edit user's place (e.g. "Moscow") */}
									{/* City, town, etc */}
									<Text_input
										name="place"
										label={translate(messages.place)}
										disabled={update_user_info_pending}
										value={user.place}/>

									{/* Edit user's country (e.g. "Russia") */}
									{/* Country */}
									<Select
										autocomplete
										name="country"
										label={translate(messages.country)}
										disabled={update_user_info_pending}
										options={this.countries}
										value={user.country}/>
								</div>
							}

							{ !edit &&
								<div>
									{/* User's name */}
									<h1 style={styles.user_name}>{user.name}</h1>

									{/* User's place and country */}
									{ (user.place || user.country) &&
										<div
											className="user-profile__location">
											{this.whereabouts().join(', ')}
										</div>
									}
								</div>
							}
						</Form>

						{/* User actions: "Send message", "Subscribe" */}
						{ !is_own_profile &&
							<div>
								{/* "Subscribe" */}
								<Button
									action={this.subscribe}>

									{/* Icon */}
									<i className="material-icons">person_add</i>
									{/* Text */}
									{translate(messages.subscribe)}
								</Button>

								{/* "Send message" */}
								<Button
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
							<div style={styles.latest_activity} className="user-profile__last-seen">
								{/* Icon */}
								<i className="material-icons">schedule</i>
								{/* "an hour ago" */}
								<Time_ago>{latest_activity_time}</Time_ago>
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
			edit : true
		})
	}

	cancel_profile_edits()
	{
		const { dispatch } = this.props

		this.reset_user_info_edit_errors()

		this.setState({ edit: false })
		dispatch({ type: 'user profile: reset uploaded user picture' })
	}

	async save_profile_edits(values)
	{
		this.reset_user_info_edit_errors()

		const
		{
			uploaded_picture,
			update_user_picture,
			update_user,
			dispatch
		}
		= this.props

		if (uploaded_picture)
		{
			await update_user_picture(uploaded_picture)
		}

		await update_user
		({
			name    : values.name,
			country : values.country,
			place   : values.place
		})

		this.setState({ edit: false })

		dispatch({ type: 'user profile: reset uploaded user picture' })
	}

	reset_user_info_edit_errors()
	{
		const { update_user_reset_error } = this.props

		update_user_reset_error()
		this.reset_upload_user_picture_errors()
	}

	reset_upload_user_picture_errors()
	{
		const { dispatch } = this.props

		dispatch({ type: 'user profile: upload user picture: reset error' })
		dispatch({ type: 'user profile: upload user picture: error: too big: reset' })
		dispatch({ type: 'user profile: upload user picture: error: unsupported file: reset' })
	}

	async block_user()
	{
		const { user, get_user, generate_block_user_token, dispatch } = this.props

		const token_id = await generate_block_user_token(user.id)

		await get_user(user.id)

		dispatch(redirect(`/user/block/${token_id}`))
	}

	async unblock_user()
	{
		const { user, get_user, unblock_user, translate, dispatch } = this.props

		await unblock_user(user.id)

		await get_user(user.id)

		dispatch({ type: 'snack', snack: translate(messages.user_unblocked) })
	}

	send_message()
	{
		const { user } = this.props
	}

	subscribe()
	{
		const { user } = this.props
	}

	async upload_user_picture(file)
	{
		const
		{
			upload_user_picture,
			dispatch
		}
		=
		this.props

		// Check file format
		if (!['image/jpeg', 'image/png', 'image/svg+xml'].has(file.type))
		{
			return dispatch({ type: 'user profile: upload user picture: error: unsupported file' })
		}

		// Check file size limit
		if (file.size > configuration.image_service.file_size_limit)
		{
			return dispatch({ type: 'user profile: upload user picture: error: too big' })
		}

		// Upload the image
		const uploaded_picture = await upload_user_picture(file)

		// Preload the uploaded image

		const image = new Image()

		image.onload  = () => dispatch({ type: 'user profile: upload user picture: prefetch: done', result: uploaded_picture })
		image.onerror = () => dispatch({ type: 'user profile: upload user picture: prefetch: error' })

		image.src = url(get_preferred_size(uploaded_picture.sizes, this.user_picture.decoratedComponentInstance.width()))
	}

	// User's [place, country]
	whereabouts()
	{
		const { user, translate } = this.props

		const whereabouts = []

		if (user.place)
		{
			whereabouts.push(user.place)
		}

		if (user.country)
		{
			whereabouts.push(translate({ id: `country.${user.country}` }))
		}

		return whereabouts
	}

	validate_name(value)
	{
		const { translate } = this.props

		if (!value)
		{
			return translate(messages.name_is_required)
		}
	}
}

@CanDrop(File, ({ uploading_picture, choosing_user_picture, upload_user_picture }, dropped) =>
{
	if (!uploading_picture)
	{
		choosing_user_picture()
		upload_user_picture(dropped)
	}
})
class Uploadable_user_picture extends React.Component
{
	render()
	{
		const
		{
			edit,
			user,
			uploaded_picture,
			uploading_picture,
			upload_user_picture,
			choosing_user_picture,
			translate,

			dropTarget,
			draggedOver,
			canDrop
		}
		= this.props

		{/* User picture */}
		return dropTarget(
			<div
				style={styles.user_picture}
				className={classNames
				(
					'user-picture',
					'user-profile__picture',
					'card'
				)}>

				{/* The picture itself */}
				<User_picture
					ref={ref => this.user_picture = ref}
					user={user}
					picture={edit ? uploaded_picture : undefined}/>

				{/* "Change user picture" overlay */}
				{ edit && !uploaded_picture &&
					<div
						className="user-profile__picture__change__overlay"
						style={styles.user_picture_element_overlay_background}/>
				}

				{/* A colored overlay indicating "can drop image file here" situation */}
				{ edit &&
					<div
						className={classNames
						(
							'user-profile__picture__change__droppable-overlay',
							{
								'user-profile__picture__change__droppable-overlay--can-drop'    : draggedOver,
								'user-profile__picture__change__droppable-overlay--cannot-drop' : draggedOver && !canDrop
							}
						)}
						style={styles.user_picture_element_overlay_background}/>
				}

				{/* "Change user picture" file uploader */}
				{ edit &&
					<FileUpload
						className="user-profile__picture__change__label"
						style={styles.user_picture_element_overlay_label}
						disabled={uploading_picture}
						onClick={choosing_user_picture}
						action={upload_user_picture}>

						{/* "Change user picture" label */}
						{!uploaded_picture && !uploading_picture && translate(messages.change_user_picture)}

						{/* "Uploading picture" spinner */}
						{uploading_picture && <ActivityIndicator style={styles.user_picture_element_spinner}/>}
					</FileUpload>
				}
			</div>
		)
	}

	width()
	{
		return this.user_picture.width()
	}
}

const styles = style
`
	user_picture
		position : relative

		element
			position         : absolute
			top              : 0
			left             : 0

			width            : 100%
			height           : 100%
			border-radius    : inherit

			&spinner
				display    : block
				color      : white
				padding    : 20%
				box-sizing : border-box

			&overlay
				cursor : pointer

				&background
					opacity : 0.5

				&label
					display     : flex
					align-items : center
					text-align  : center
					color       : white
					text-shadow : 0 0.05em 0.1em rgba(0, 0, 0, 0.75)
					user-select : none

	user_name
		font-size     : 1.5rem
		margin-bottom : 0

	latest_activity
		cursor : default
`

const messages = defineMessages
({
	name:
	{
		id             : `user.profile.name`,
		description    : `User's name`,
		defaultMessage : `Name`
	},
	place:
	{
		id             : `user.profile.place`,
		description    : `User's place of living`,
		defaultMessage : `Place`
	},
	country:
	{
		id             : `user.profile.country`,
		description    : `User's country`,
		defaultMessage : `Choose your country`
	},
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
	blocked:
	{
		id             : `user.profile.blocked`,
		description    : `A note that the user is temporarily blocked`,
		defaultMessage : `This user was temporarily blocked {blocked_at}`
	},
	blocked_detailed:
	{
		id             : `user.profile.blocked_detailed`,
		description    : `A detailed note that the user is blocked`,
		defaultMessage : `This user was blocked {blocked_at} by {blocked_by} with reason: "{blocked_reason}"`
	},
	user_unblocked:
	{
		id             : `user.profile.unblocked`,
		description    : `A note that the user has been unblocked`,
		defaultMessage : `User unblocked`
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
	},
	uploaded_user_picture_is_too_big_error:
	{
		id             : `user.profile.uploaded_user_picture_is_too_big_error`,
		description    : `The image user tried to upload is too big`,
		defaultMessage : `The image file you tried to upload is too big. Only images up to 10 Megabytes are allowed.`
	},
	unsupported_uploaded_user_picture_file_error:
	{
		id             : `user.profile.unsupported_uploaded_user_picture_file_error`,
		description    : `The image user tried to upload is of an unsupported file format`,
		defaultMessage : `The file you tried to upload is not supported for user pictures. Only JPG, PNG and SVG images are supported.`
	},
	name_is_required:
	{
		id             : `user.profile.name_is_required`,
		description    : `The user tried to save his profile with a blank "name" field`,
		defaultMessage : `Enter your name`
	},
	block_user:
	{
		id             : `user.profile.block`,
		description    : `An action to block this user`,
		defaultMessage : `Block`
	},
	unblock_user:
	{
		id             : `user.profile.unblock`,
		description    : `An action to unblock this user`,
		defaultMessage : `Unblock`
	}
})