import React, { PropTypes } from 'react'
import shallow_not_equal from 'react-addons-shallow-compare'

export default class Image extends React.Component
{
	static propTypes = 
	{
		src           : PropTypes.string,
		type          : PropTypes.string,
		default_width : PropTypes.number,
		max_width     : PropTypes.number,

		sizes : PropTypes.arrayOf(PropTypes.shape
		({
			// `width` is not required for vector graphics
			width : PropTypes.number,
			name  : PropTypes.string.isRequired
		}))
	}

	state = {}

	constructor(props, context)
	{
		super(props, context)
		
		if (props.sizes)
		{
			this.state.size = get_preferred_size(props.sizes, props.default_width)
		}
	}

	componentDidMount()
	{
		if (this.props.sizes)
		{
			this.refresh_size()
		}

		if (!window._responsive_images)
		{
			const _responsive_images =
			{
				_components : [],
				_register(component)
				{
					this._components.push(component)
				},
				_unregister(component)
				{
					this._components.remove(component)
				},
				_on_resize()
				{
					if (this._debounce_timer)
					{
						clearTimeout(this._debounce_timer)
					}

					this._debounce_timer = setTimeout(this._resize, 500)
				},
				_resize()
				{
					this._debounce_timer = undefined

					for (let component of this._components)
					{
						component.refresh_size()
					}
				},
				_destroy()
				{
					for (let component of this._components)
					{
						this._unregister(component)
					}

					window.removeEventListener('resize', this._on_resize)
				}
			}

			_responsive_images._resize    = _responsive_images._resize.bind(_responsive_images)
			_responsive_images._on_resize = _responsive_images._on_resize.bind(_responsive_images)

			window.addEventListener('resize', _responsive_images._on_resize)

			window._responsive_images = _responsive_images
		}
	}

	componentWillUnmount()
	{
		window._responsive_images._destroy()
	}

	componentWillReceiveProps(next_props)
	{
		if (next_props.sizes && next_props.sizes !== this.props.sizes)
		{
			this.refresh_size(next_props.sizes, true)
		}
	}

	shouldComponentUpdate(next_props, next_state)
	{
		return shallow_not_equal(this, next_props, next_state)
	}

	render()
	{
		const { src, style, className } = this.props

		return <img
			ref="image"
			src={src || this.url()}
			style={style}
			className={className}/>
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
		return this.refs.image.offsetWidth
	}

	get_preferred_size(sizes)
	{
		return get_preferred_size(sizes, this.width(), this.props.max_width)
	}

	url()
	{
		const { type } = this.props
		const { size } = this.state

		return url(size, type)
	}
}

export function url(size, type)
{
	let subpath
	switch (type)
	{
		case 'user_picture':
			subpath = `${_user_pictures_path_}/`
			break

		default:
			subpath = `uploaded/`
			break
	}

	return `${_image_service_url_}/${subpath}${size.name}`
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

	width  *= device_pixel_ratio

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