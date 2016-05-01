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
			width : PropTypes.number.isRequired,
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
			this.refresh_size(this.props.sizes)
		}
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

	refresh_size(sizes, force)
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

	get_preferred_size(sizes)
	{
		return get_preferred_size(sizes, this.refs.image.offsetWidth, this.props.max_width)
	}

	url()
	{
		const { type } = this.props
		const { size } = this.state

		let subpath = ''
		switch (type)
		{
			case 'user_picture':
				subpath = `${_user_pictures_path_}/`
				break
		}

		return `${_image_service_url_}/${subpath}${size.name}`
	}
}

function get_preferred_size(sizes, width, max_width)
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