import React, { PropTypes, Component } from 'react'
import { FileUpload, ActivityIndicator, File, CanDrop } from 'react-responsive-ui'
import { flat as style } from 'react-styling'
import { defineMessages } from 'react-intl'
import classNames from 'classnames'

import international from '../../../international/internationalize'

import { get_preferred_size, url } from '../../../components/image'

@international
@CanDrop(File, ({ uploading, onChoose, upload }, dropped, component) =>
{
	if (!uploading)
	{
		onChoose()
		upload(dropped)
		component.setState({ uploading: true })
	}
})
export default class Upload_picture extends Component
{
	static propTypes =
	{
		changing        : PropTypes.bool.isRequired,
		upload          : PropTypes.func.isRequired,
		uploading       : PropTypes.bool.isRequired,
		onChoose        : PropTypes.func.isRequired,
		onError         : PropTypes.func.isRequired,
		onFinished      : PropTypes.func.isRequired,
		maxSize         : PropTypes.number,
		types           : PropTypes.arrayOf(PropTypes.string).isRequired,
		children        : PropTypes.element.isRequired
	}

	static defaultProps =
	{
		changing  : false,
		uploading : false,
		types     : ['image/jpeg', 'image/png', 'image/svg+xml']
	}

	state = {}

	componentWillReceiveProps(new_props)
	{
		if (this.props.changing && !new_props.changing)
		{
			this.props.onFinished()
			this.setState({ uploaded_picture: undefined })
		}
	}

	render()
	{
		const
		{
			changing,
			upload,
			onChoose,
			translate,
			children,

			dropTarget,
			draggedOver,
			canDrop
		}
		= this.props

		const
		{
			uploading,
			uploaded_picture
		}
		= this.state

		{/* User picture */}
		return dropTarget(
			<div
				style={ styles.uploadable_picture }
				className={ classNames
				(
					'user-picture',
					'user-profile__picture',
					'card'
				) }>

				{/* The picture itself */}
				{
					React.cloneElement(children,
					{
						ref : ref => this.picture = ref,
						picture : uploaded_picture
					})
				}

				{/* "Change picture" overlay */}
				{ changing && !uploaded_picture &&
					<div
						className="user-profile__picture__change__overlay"
						style={ styles.uploadable_picture_element_overlay_background }/>
				}

				{/* A colored overlay indicating "can drop image file here" situation */}
				{ changing &&
					<div
						className={ classNames
						(
							'user-profile__picture__change__droppable-overlay',
							{
								'user-profile__picture__change__droppable-overlay--can-drop'    : draggedOver,
								'user-profile__picture__change__droppable-overlay--cannot-drop' : draggedOver && !canDrop
							}
						) }
						style={ styles.uploadable_picture_element_overlay_background }/>
				}

				{/* "Change picture" file uploader */}
				{ changing &&
					<FileUpload
						className="user-profile__picture__change__label"
						style={ styles.uploadable_picture_element_overlay_label }
						disabled={ uploading }
						onClick={ onChoose }
						action={ this.upload }>

						{/* "Change picture" label */}
						{ !uploaded_picture && !uploading && translate(messages.change_picture) }

						{/* "Uploading picture" spinner */}
						{ uploading && <ActivityIndicator style={ styles.uploadable_picture_element_spinner }/> }
					</FileUpload>
				}
			</div>
		)
	}

	width()
	{
		return this.picture.width()
	}

	upload = (file) =>
	{
		upload_and_wait_for_preload(file, this.props, this)
	}
}

const styles = style
`
	uploadable_picture
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
`

const messages = defineMessages
({
	change_picture:
	{
		id             : `upload_picture.change`,
		description    : `An action label to change the picture`,
		defaultMessage : `Change picture`
	}
})

async function upload_and_wait_for_preload(file, props, component)
{
	const
	{
		upload,
		onError,
		maxSize,
		types,
		onFinished
	}
	=
	props

	// Check file format
	if (types && types.indexOf(file.type) === -1)
	{
		return onError('unsupported')
	}

	// Check file size limit
	if (maxSize && file.size > maxSize)
	{
		return onError('oversized')
	}

	// Set "uploading" flag
	component.setState
	({
		uploading : true,
		uploaded_picture : undefined
	})

	let uploaded_picture

	const finished = () =>
	{
		component.setState
		({
			uploading : false,
			uploaded_picture
		})
	}

	// Upload the picture
	try
	{
		uploaded_picture = await upload(file)
	}
	catch (error)
	{
		// Unset "uploading" flag
		finished()

		console.error(error)
		return onError(String(error))
	}

	// Preload the uploaded image

	const image = new Image()

	image.onload = () =>
	{
		// Unset "uploading" flag
		finished()

		onFinished(uploaded_picture)
	}

	image.onerror = (error) =>
	{
		// Unset "uploading" flag
		finished()

		onError(String(error))
	}

	image.src = url(get_preferred_size(uploaded_picture.sizes, component.width()))
}