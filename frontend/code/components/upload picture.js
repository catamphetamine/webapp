import React, { PropTypes, Component } from 'react'
import ReactDOM from 'react-dom'
import { FileUpload, ActivityIndicator, File, CanDrop } from 'react-responsive-ui'
import { flat as style } from 'react-styling'
import { defineMessages } from 'react-intl'
import classNames from 'classnames'

import international from '../international/internationalize'

import Responsive_picture, { get_preferred_size, url } from './picture'

const drop_area =
@CanDrop(File, (props, dropped, component) =>
{
	const { uploading, onChoose } = props

	if (uploading)
	{
		return
	}

	onChoose()
	upload_and_wait_for_preload(dropped, props, component)
})
class Upload_picture extends Component
{
	static propTypes =
	{
		changing        : PropTypes.bool.isRequired,
		changeLabel     : PropTypes.string,
		upload          : PropTypes.func.isRequired,
		uploading       : PropTypes.bool.isRequired,
		onChoose        : PropTypes.func.isRequired,
		onError         : PropTypes.func.isRequired,
		onFinished      : PropTypes.func.isRequired,
		maxSize         : PropTypes.number,
		types           : PropTypes.arrayOf(PropTypes.string).isRequired,
		children        : PropTypes.element.isRequired,
		className       : PropTypes.string
	}

	state = {}

	componentWillReceiveProps(new_props)
	{
		// Reset the uploaded picture on "cancel"
		if (this.props.changing && !new_props.changing)
		{
			const { onFinished } = this.props

			onFinished()
			this.setState({ uploaded_picture: undefined })
		}
	}

	render()
	{
		const
		{
			changing,
			changeLabel,
			upload,
			onChoose,
			translate,
			children,
			className,

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

		const picture_props =
		{
			ref : ref => this.picture = ref
		}

		if (uploaded_picture)
		{
			picture_props.picture = uploaded_picture
			picture_props.uploaded = true
			picture_props.className = classNames
			({
				'upload-picture__picture--change' : uploading
			},
			picture_props.className)
		}

		{/* User picture */}
		return dropTarget(
			<div
				style={ styles.uploadable_picture }
				className={ classNames
				(
					'upload-picture',
					className
				) }>

				{/* The picture itself */}
				{ React.cloneElement(children, picture_props) }

				{/* "Change picture" overlay */}
				{ changing && !uploaded_picture &&
					<div
						className="upload-picture__change-overlay"
						style={ styles.uploadable_picture_element_overlay_background }/>
				}

				{/* A colored overlay indicating "can drop image file here" situation */}
				{ changing &&
					<div
						className={ classNames
						(
							'upload-picture__droppable-overlay',
							{
								'upload-picture__droppable-overlay--can-drop'    : draggedOver,
								'upload-picture__droppable-overlay--cannot-drop' : draggedOver && !canDrop
							}
						) }
						style={ styles.uploadable_picture_element_overlay_background }/>
				}

				{/* "Change picture" file uploader */}
				{ changing &&
					<FileUpload
						className="upload-picture__change-label"
						style={ styles.uploadable_picture_element_overlay_label }
						disabled={ uploading }
						onClick={ onChoose }
						action={ this.upload }>

						{/* "Change picture" label */}
						{ !uploaded_picture && !uploading && (changeLabel || translate(messages.change_picture)) }

						{/* "Uploading picture" spinner */}
						{ uploading && <ActivityIndicator style={ styles.uploadable_picture_element_spinner }/> }
					</FileUpload>
				}
			</div>
		)
	}

	width()
	{
		return ReactDOM.findDOMNode(this.picture).offsetWidth
	}

	upload = (file) =>
	{
		upload_and_wait_for_preload(file, this.props, this)
	}
}

const styles = style
`
	uploadable_picture
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
					display         : flex
					align-items     : center
					justify-content : center
					text-align      : center
					color           : white
					text-shadow     : 0 0.05em 0.1em rgba(0, 0, 0, 0.75)
					user-select     : none
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

	image.src = url(get_preferred_size(uploaded_picture.sizes, component.width()), 'uploaded')
}

// `react-dnd` won't account for default properties
// when defined on the wrapped component intself
drop_area.defaultProps =
{
	changing  : false,
	uploading : false,
	types     : ['image/jpeg', 'image/png', 'image/svg+xml']
}

export default international(drop_area)

const picture = PropTypes.shape
({
	sizes: PropTypes.arrayOf(PropTypes.object).isRequired
})

export class Picture extends Component
{
	static propTypes =
	{
		fallback  : picture,
		picture   : picture,
		type      : PropTypes.string.isRequired,
		uploaded  : PropTypes.bool.isRequired,
		maxWidth  : PropTypes.number,
		style     : PropTypes.object,
		className : PropTypes.string
	}

	static defaultProps =
	{
		uploaded : false
	}

	render()
	{
		const
		{
			fallback,
			picture,
			uploaded,
			...rest
		}
		= this.props

		let type
		let sizes

		if (picture)
		{
			type  = uploaded ? 'uploaded' : this.props.type
			sizes = picture.sizes
		}
		else if (fallback)
		{
			sizes = fallback.sizes
		}

		return <Responsive_picture
			type={ type }
			sizes={ sizes }
			{ ...rest }/>
	}
}