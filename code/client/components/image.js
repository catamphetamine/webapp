import React, { PropTypes } from 'react'
import shallow_not_equal from 'react-addons-shallow-compare'

export default class Image extends React.Component
{
	static propTypes = 
	{
		src   : PropTypes.string,
		type  : PropTypes.string,
		sizes : PropTypes.arrayOf(PropTypes.shape
		({
			width  : PropTypes.number.isRequired,
			height : PropTypes.number.isRequired,
			name   : PropTypes.string.isRequired
		}))
		.isRequired
	}

	state = {}

	constructor(props, context)
	{
		super(props, context)
		
		if (props.sizes)
		{
			this.state.size = props.sizes[0]
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
		if (shallow_not_equal(this, next_props, this.state) && next_props.sizes)
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
			(preferred_size.width > size.width || preferred_size.height > size.height))
		{
			this.setState({ size: preferred_size })
		}
	}

	get_preferred_size(sizes)
	{
		return get_preferred_size(sizes, this.refs.image.offsetWidth, this.refs.image.offsetHeight)
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

function get_preferred_size(sizes, width, height)
{
	let device_pixel_ratio = 1

	if (typeof(window) !== 'undefined' && window.devicePixelRatio !== undefined)
	{
		device_pixel_ratio = window.devicePixelRatio
	}

	width  *= device_pixel_ratio
	height *= device_pixel_ratio

	for (let size of sizes)
	{
		if (size.width >= width && size.height >= height)
		{
			return size
		}
	}

	return sizes[sizes.length - 1]
}

// let width
// let height

// if (arguments.length === 2)
// {
// 	if (dimensions.nodeType === 1)
// 	{
// 		width  = dimensions.offsetWidth
// 		height = dimensions.offsetHeight
// 	}
// 	else if (Array.isArray(dimensions))
// 	{
// 		width  = dimensions[0]
// 		height = dimensions[1]
// 	}
// 	else
// 	{
// 		return sizes[0]
// 	}
// }
// else
// {
// 	sizes  = arguments[0]
// 	width  = arguments[1]
// 	height = arguments[2]
// }
