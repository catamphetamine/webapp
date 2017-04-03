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
	const { onChoose } = props
	const { uploading } = component.state

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
		type            : PropTypes.string.isRequired,
		changing        : PropTypes.bool.isRequired,
		changeLabel     : PropTypes.string,
		upload          : PropTypes.func.isRequired,
		disabled        : PropTypes.bool.isRequired,
		onChoose        : PropTypes.func.isRequired,
		onError         : PropTypes.func.isRequired,
		onFinished      : PropTypes.func.isRequired,
		maxSize         : PropTypes.number.isRequired,
		types           : PropTypes.arrayOf(PropTypes.string).isRequired,
		pattern         : PropTypes.bool.isRequired,
		// children        : PropTypes.element.isRequired,
		style           : PropTypes.object,
		className       : PropTypes.string
	}

	static defaultProps =
	{
		pattern : false,
		maxSize : configuration.image_service.file_size_limit,
		disabled : false
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
			type,
			changing,
			changeLabel,
			upload,
			onChoose,
			disabled,
			translate,
			children,
			style,
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

		const picture_props = {}

		if (uploaded_picture)
		{
			picture_props.picture   = uploaded_picture
			picture_props.uploaded  = true
			picture_props.className = classNames
			({
				'upload-picture__picture--change' : uploading
			},
			picture_props.className)
		}

		{/* User picture */}
		return dropTarget(
			<div
				ref={ ref => this.picture = ref }
				style={ styles.uploadable_picture }
				style={ style }
				className={ classNames
				(
					'upload-picture',
					className
				) }>

				{/* The picture itself */}
				{
					React.Children.map(children, (child) =>
					{
						if (child.type && typeof(child.type) !== 'string')
						{
							return React.cloneElement(child, picture_props)
						}

						return child
					})
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

				{/* "Change picture" file uploader and overlay */}
				{ changing &&
					<FileUpload
						className={ classNames('upload-picture__change-overlay',
						{
							'upload-picture__change-overlay--uploading' : uploading,
							'upload-picture__change-overlay--uploaded'  : uploaded_picture
						}) }
						style={ styles.uploadable_picture_element_overlay_label }
						disabled={ disabled || uploading }
						onClick={ onChoose }
						action={ this.upload }>

						{/* "Change picture" label */}
						{ !uploaded_picture && !uploading && changeLabel !== '' && (changeLabel || translate(messages.change_picture)) }

						{/* "Uploading picture" spinner */}
						{ uploading &&
							<ActivityIndicator
								style={ styles.uploadable_picture_spinner }
								className="upload-picture__indicator"/>
						}
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
		type      : PropTypes.string,
		pattern   : PropTypes.bool.isRequired,
		uploaded  : PropTypes.bool.isRequired,
		maxWidth  : PropTypes.number,
		style     : PropTypes.object,
		className : PropTypes.string
	}

	static defaultProps =
	{
		uploaded : false,
		pattern  : false
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

		let { type } = this.props
		let sizes

		if (picture)
		{
			if (uploaded)
			{
				type = 'uploaded'
			}

			sizes = picture.sizes
		}
		else if (fallback)
		{
			sizes = fallback.sizes
		}

		return <Responsive_picture
			{ ...rest }
			type={ type }
			sizes={ sizes }/>
	}
}

const styles = style
`
	uploadable_picture
		spinner
			display    : block
			box-sizing : border-box

		element
			position         : absolute
			top              : 0
			left             : 0

			width            : 100%
			height           : 100%
			border-radius    : inherit

			&overlay
				cursor : pointer

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
		type,
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
		uploading : true
	})

	let uploaded_picture

	// Upload the picture
	try
	{
		uploaded_picture = await upload(file, type)
		await prefetch_image(url(get_preferred_size(uploaded_picture.sizes, component.width()), 'uploaded'))
		onFinished(uploaded_picture)
	}
	catch (error)
	{
		console.error(error)
		return onError(String(error))
	}
	finally
	{
		// Reset "uploading" flag
		component.setState
		({
			uploading : false
		})

		// If the picture was uploaded then render it
		if (uploaded_picture)
		{
			component.setState
			({
				uploaded_picture
			})
		}
	}
}

// Preloads an image before displaying it
function prefetch_image(url)
{
	return new Promise((resolve, reject) =>
	{
		const image = new Image()

		image.onload = () =>
		{
			resolve()
		}

		image.onerror = (error) =>
		{
			reject(error)
		}

		image.src = url
	})
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