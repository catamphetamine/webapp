import React, { PropTypes, PureComponent } from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'

const transparent_pixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

export default class Picture extends PureComponent
{
	static propTypes =
	{
		src           : PropTypes.string,
		type          : PropTypes.string,
		maxWidth      : PropTypes.number,
		// defaultWidth  : PropTypes.number,
		children      : PropTypes.node,

		sizes : PropTypes.arrayOf(PropTypes.shape
		({
			// `width` is not required for vector graphics
			width : PropTypes.number,
			file  : PropTypes.string.isRequired
		}))
	}

	state = {}

	componentDidMount()
	{
		const { sizes } = this.props

		// When the DOM node has been mounted
		// its width in pixels is known
		// so an appropriate size can now be picked.
		if (sizes)
		{
			this.refresh_size()
		}

		register_picture(this.picture)
	}

	componentWillUnmount()
	{
		unregister_picture(this.picture)
	}

	componentWillReceiveProps(next_props)
	{
		if (next_props.sizes && next_props.sizes !== this.props.sizes)
		{
			this.refresh_size(next_props.sizes, true)
		}
	}

	render()
	{
		const { src, style, className, children } = this.props

		const markup =
		(
			<div
				style={ style }
				className={ classNames('picture', className) }>

				<img
					ref={ ref => this.picture = ref }
					src={ typeof window === 'undefined' ? transparent_pixel : (src || this.url() || transparent_pixel) }
					style={ styles.image }
					className="picture__image"/>

				{ children }
			</div>
		)

		return markup
	}

	refresh_size(sizes = this.props.sizes, force)
	{
		const { size } = this.state
		const preferred_size = this.get_preferred_size(sizes)

		if (force ||
			!size ||
			preferred_size.width > size.width)
		{
			this.setState({ size: preferred_size })
		}
	}

	width()
	{
		return ReactDOM.findDOMNode(this.picture).offsetWidth
	}

	get_preferred_size(sizes)
	{
		const { maxWidth } = this.props

		if (!sizes)
		{
			return
		}

		return get_preferred_size(sizes, this.width(), maxWidth)
	}

	url()
	{
		const { type } = this.props
		const { size } = this.state

		if (!size)
		{
			return
		}

		return url(size, type)
	}
}

export function url(size, type)
{
	let subpath

	switch (type)
	{
		case 'poster_picture':
			subpath = `${_poster_pictures_path_}/`
			break

		// Temporarily uploaded pictures (before saving them)
		case 'uploaded':
			subpath = `uploaded/`
			break

		default:
			// throw new Error(`Unknown picture type: ${type}`)
			return size.file
	}

	return `${_image_service_url_}/${subpath}${size.file}`
}

export function get_preferred_size(sizes, width, max_width)
{
	if (!width)
	{
		return sizes.first()
	}

	let device_pixel_ratio = 1

	if (typeof(window) !== 'undefined' && window.devicePixelRatio !== undefined)
	{
		device_pixel_ratio = window.devicePixelRatio
	}

	width *= device_pixel_ratio

	let previous_size
	for (let size of sizes)
	{
		if (size.width > max_width)
		{
			return previous_size || sizes.first()
		}

		if (size.width >= width)
		{
			return size
		}

		previous_size = size
	}

	return sizes.last()
}

const styles =
{
	image:
	{
		maxWidth     : '100%',
		maxHeight    : '100%',
		borderRadius : 'inherit'
	}
}

function register_picture(component)
{
	if (!get_pictures_controller())
	{
		create_pictures_controller()
	}

	get_pictures_controller().register(component)
}

function unregister_picture(component)
{
	get_pictures_controller().unregister(component)
}

function get_pictures_controller()
{
	return window._responsive_images
}

function create_pictures_controller()
{
	const images =
	{
		components : [],
		register(component)
		{
			this.components.push(component)
		},
		unregister(component)
		{
			this.components.remove(component)
		},
		on_resize()
		{
			if (this.debounce_timer)
			{
				clearTimeout(this.debounce_timer)
			}

			this.debounce_timer = setTimeout(this.resize, 500)
		},
		resize()
		{
			this.debounce_timer = undefined

			for (const component of this.components)
			{
				component.refresh_size()
			}
		},
		destroy()
		{
			for (const component of this.components)
			{
				this.unregister(component)
			}

			window.removeEventListener('resize', this.on_resize)
		}
	}

	images.resize    = images.resize.bind(images)
	images.on_resize = images.on_resize.bind(images)

	window.addEventListener('resize', images.on_resize)

	window._responsive_images = images
}