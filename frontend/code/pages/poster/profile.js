import React, { Component, PropTypes } from 'react'
import { Title, preload, redirect }    from 'react-isomorphic-render'
import { connect }                     from 'react-redux'
import { flat as style }               from 'react-styling'
import classNames                      from 'classnames'
import Redux_form                      from 'simpler-redux-form'

import { defineMessages, FormattedMessage } from 'react-intl'
import { Form, Button, FileUpload, ActivityIndicator, File, CanDrop } from 'react-responsive-ui'

import Clock_icon      from '../../../assets/images/icons/clock.svg'
import Message_icon    from '../../../assets/images/icons/message.svg'
import Person_add_icon from '../../../assets/images/icons/person add.svg'

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
	connector
}
from '../../redux/poster/profile'

import
{
	generate_block_poster_token,
	unblock_poster
}
from '../../redux/poster/block'

import { snack } from '../../redux/snackbar'

import Text_input   from '../../components/form/text input'
import Submit       from '../../components/form/submit'
import Select       from '../../components/form/select'

import Poster         from '../../components/poster'
import Poster_picture from '../../components/poster picture'
import Time_ago       from '../../components/time ago'

import { get_preferred_size, url } from '../../components/image'

import can from '../../../../code/permissions'

import international from '../../international/internationalize'

const Latest_activity_time_refresh_interval = 60 * 1000 // once in a minute

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
		current_user : authentication.user,
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

	static contextTypes =
	{
		intl: PropTypes.object
	}

	constructor(props, context)
	{
		super()

		this.save_profile_edits   = this.save_profile_edits.bind(this)

		this.block_poster         = this.block_poster.bind(this)
		this.unblock_poster       = this.unblock_poster.bind(this)

		this.send_message = this.send_message.bind(this)
		this.subscribe    = this.subscribe.bind(this)

		this.upload_poster_picture = this.upload_poster_picture.bind(this)

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
			current_user,
			latest_activity_time,
			uploaded_picture,

			update_poster_info_error,
			update_poster_picture_error,
			upload_poster_picture_error,
			upload_poster_picture_other_error,

			update_poster_info_pending,
			upload_poster_picture_pending,
			update_poster_picture_pending,

			submit
		}
		= this.props

		const markup =
		(
			<div className="content user-profile">
				<Title>{ poster.name }</Title>

				{/* Left column */}
				<div className="column-m-6-of-12">

					{/* User's personal info */}
					<section
						className={ classNames
						(
							'content-section',
							'user-profile__personal-info'
						) }>

						{/* User blocked notice */}
						{ poster.blocked_at &&
							<div className="content-section__errors content-section__errors--top">
								{ poster.blocked_by.id === poster.id
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

						<Form
							busy={ update_poster_info_pending || update_poster_picture_pending || upload_poster_picture_pending }
							submit={ submit(this.save_profile_edits) }>

							{/* Edit/Save own profile */}
							{ this.is_own_profile() &&
								<div style={ styles.own_profile_actions } className="card__actions">

									{/* "Edit profile" */}
									{ !edit &&
										<Button
											className="card__action"
											action={ this.edit_profile }>
											{ translate(messages.edit_profile) }
										</Button>
									}

									{/* "Cancel changes" */}
									{  edit &&
										<Button
											action={ this.cancel_profile_edits }
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
							{ !this.is_own_profile() &&
								<div style={ styles.own_profile_actions } className="card__actions">

									{/* "Block poster" */}
									{ !poster.blocked_at && can('block poster', current_user) &&
										<Button
											className="card__action"
											action={ this.block_poster }>
											{ translate(messages.block_poster) }
										</Button>
									}

									{/* "Unblock poster" */}
									{ poster.blocked_at && can('unblock user', current_user) &&
										<Button
											className="card__action"
											action={ this.unblock_poster }>
											{ translate(messages.unblock_poster) }
										</Button>
									}
								</div>
							}

							{/* User picture */}
							<Uploadable_poster_picture
								ref={ ref => this.poster_picture = ref }
								edit={ edit }
								poster={ poster }
								uploaded_picture={ uploaded_picture }
								uploading_picture={ upload_poster_picture_pending }
								upload_poster_picture={ this.upload_poster_picture }
								choosing_poster_picture={ this.reset_upload_poster_picture_errors }
								translate={ translate }
								style={ style }/>

							{ edit &&
								<div className="rrui__form__fields">
									{/* Edit poster's name */}
									<Text_input
										name="name"
										label={ translate(messages.name) }
										value={ poster.name }
										validate={ this.validate_name }/>

									{/* Edit poster's place (e.g. "Moscow") */}
									{/* City, town, etc */}
									<Text_input
										name="place"
										label={ translate(messages.place) }
										disabled={ update_poster_info_pending }
										value={ poster.place }/>

									{/* Edit poster's country (e.g. "Russia") */}
									{/* Country */}
									<Select
										autocomplete
										name="country"
										label={ translate(messages.country) }
										disabled={ update_poster_info_pending }
										options={ this.countries }
										value={ poster.country }/>
								</div>
							}

							{ !edit &&
								<div>
									{/* User's name */}
									<h1 style={ styles.poster_name }>
										{ poster.name }
									</h1>

									{/* User's place and country */}
									{ (poster.place || poster.country) &&
										<div
											className="user-profile__location">
											{ this.whereabouts().join(', ') }
										</div>
									}
								</div>
							}
						</Form>

						{/* User actions: "Send message", "Subscribe" */}
						{ !this.is_own_profile() &&
							<div className="user-profile__actions">
								{/* "Subscribe" */}
								<div>
									<Button
										action={ this.subscribe }
										className="user-profile__action">
										{/* Icon */}
										<Person_add_icon className="user-profile__action-icon"/>
										{/* Text */}
										{ translate(messages.subscribe) }
									</Button>
								</div>

								{/* "Send message" */}
								<div>
									<Button
										action={ this.send_message }
										className="user-profile__action">
										{/* Icon */}
										<Message_icon className="user-profile__action-icon"/>
										{/* Text */}
										{ translate(messages.send_message) }
									</Button>
								</div>
							</div>
						}

						{/* Online status: "Last seen: an hour ago" */}
						{ latest_activity_time &&
							<div style={ styles.latest_activity } className="user-profile__last-seen">
								{/* Icon */}
								<Clock_icon className="user-profile__last-seen-icon"/>
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

	is_own_profile()
	{
		const { current_user, poster } = this.props

		return current_user && current_user.id === poster.id
	}

	edit_profile = () =>
	{
		this.setState
		({
			edit : true
		})
	}

	cancel_profile_edits = () =>
	{
		const { set_uploaded_poster_picture, reset_update_poster_picture_error } = this.props

		this.reset_poster_info_edit_errors()

		this.setState({ edit: false })

		reset_update_poster_picture_error()
		// Clear the temporary uploaded picture
		set_uploaded_poster_picture()
	}

	async save_profile_edits(values)
	{
		try
		{
			this.reset_poster_info_edit_errors()

			const
			{
				poster,
				uploaded_picture,
				update_poster_picture,
				update_poster,
				set_uploaded_poster_picture
			}
			= this.props

			if (uploaded_picture)
			{
				await update_poster_picture(poster.id, uploaded_picture)
			}

			await update_poster(poster.id,
			{
				name    : values.name,
				country : values.country,
				place   : values.place
			})

			this.setState({ edit: false })

			set_uploaded_poster_picture()
		}
		catch (error)
		{
			console.error(error)
		}
	}

	reset_poster_info_edit_errors = () =>
	{
		const { reset_update_poster_error } = this.props

		reset_update_poster_error()
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

	async upload_poster_picture(file)
	{
		const
		{
			upload_poster_picture,
			set_upload_poster_picture_other_error,
			set_uploaded_poster_picture
		}
		=
		this.props

		// Check file format
		if (!['image/jpeg', 'image/png', 'image/svg+xml'].has(file.type))
		{
			return set_upload_poster_picture_other_error('unsupported')
		}

		// Check file size limit
		if (file.size > configuration.image_service.file_size_limit)
		{
			return set_upload_poster_picture_other_error('oversized')
		}

		// Upload the image
		const uploaded_picture = await upload_poster_picture(file)

		// Preload the uploaded image

		const image = new Image()

		image.onload  = () => set_uploaded_poster_picture(uploaded_picture)
		image.onerror = () => set_upload_poster_picture_other_error(true)

		image.src = url(get_preferred_size(uploaded_picture.sizes, this.poster_picture.decoratedComponentInstance.width()))
	}

	// User's [place, country]
	whereabouts()
	{
		const { poster, translate } = this.props

		const whereabouts = []

		if (poster.place)
		{
			whereabouts.push(poster.place)
		}

		if (poster.country)
		{
			whereabouts.push(translate({ id: `country.${poster.country}` }))
		}

		return whereabouts
	}

	validate_name = (value) =>
	{
		const { translate } = this.props

		if (!value)
		{
			return translate(messages.name_is_required)
		}
	}
}

@CanDrop(File, ({ uploading_picture, choosing_poster_picture, upload_poster_picture }, dropped) =>
{
	if (!uploading_picture)
	{
		choosing_poster_picture()
		upload_poster_picture(dropped)
	}
})
class Uploadable_poster_picture extends React.Component
{
	render()
	{
		const
		{
			edit,
			poster,
			uploaded_picture,
			uploading_picture,
			upload_poster_picture,
			choosing_poster_picture,
			translate,

			dropTarget,
			draggedOver,
			canDrop
		}
		= this.props

		{/* User picture */}
		return dropTarget(
			<div
				style={ styles.poster_picture }
				className={ classNames
				(
					'user-picture',
					'user-profile__picture',
					'card'
				) }>

				{/* The picture itself */}
				<Poster_picture
					ref={ ref => this.poster_picture = ref }
					poster={ poster }
					picture={ edit ? uploaded_picture : undefined }/>

				{/* "Change poster picture" overlay */}
				{ edit && !uploaded_picture &&
					<div
						className="user-profile__picture__change__overlay"
						style={ styles.poster_picture_element_overlay_background }/>
				}

				{/* A colored overlay indicating "can drop image file here" situation */}
				{ edit &&
					<div
						className={ classNames
						(
							'user-profile__picture__change__droppable-overlay',
							{
								'user-profile__picture__change__droppable-overlay--can-drop'    : draggedOver,
								'user-profile__picture__change__droppable-overlay--cannot-drop' : draggedOver && !canDrop
							}
						) }
						style={ styles.poster_picture_element_overlay_background }/>
				}

				{/* "Change poster picture" file uploader */}
				{ edit &&
					<FileUpload
						className="user-profile__picture__change__label"
						style={styles.poster_picture_element_overlay_label}
						disabled={uploading_picture}
						onClick={choosing_poster_picture}
						action={upload_poster_picture}>

						{/* "Change poster picture" label */}
						{ !uploaded_picture && !uploading_picture && translate(messages.change_poster_picture) }

						{/* "Uploading picture" spinner */}
						{ uploading_picture && <ActivityIndicator style={ styles.poster_picture_element_spinner }/> }
					</FileUpload>
				}
			</div>
		)
	}

	width()
	{
		return this.poster_picture.width()
	}
}

const styles = style
`
	poster_picture
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

	poster_name
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
	change_poster_picture:
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
	poster_unblocked:
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
	poster_picture_upload_error:
	{
		id             : `user.profile.user_picture_upload_error`,
		description    : `Failed to upload user picture`,
		defaultMessage : `Couldn't process the picture`
	},
	uploaded_poster_picture_is_too_big_error:
	{
		id             : `user.profile.uploaded_user_picture_is_too_big_error`,
		description    : `The image user tried to upload is too big`,
		defaultMessage : `The image file you tried to upload is too big. Only images up to 10 Megabytes are allowed.`
	},
	unsupported_uploaded_poster_picture_file_error:
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
	block_poster:
	{
		id             : `user.profile.block`,
		description    : `An action to block this user`,
		defaultMessage : `Block`
	},
	unblock_poster:
	{
		id             : `user.profile.unblock`,
		description    : `An action to unblock this user`,
		defaultMessage : `Unblock`
	}
})