import React, { PropTypes } from 'react'
import classNames from 'classnames'

import Image from './image'

export default class User_picture extends React.Component
{
	static propTypes =
	{
		user : PropTypes.shape
		({
			picture_sizes : PropTypes.arrayOf(PropTypes.shape
			({
				// `width` and `height` are not required for vector graphics
				width  : PropTypes.number,
				height : PropTypes.number,
				name   : PropTypes.string.isRequired
			}))
		})
		.isRequired,

		picture : PropTypes.shape
		({
			sizes : PropTypes.arrayOf(PropTypes.shape
			({
				// `width` and `height` are not required for vector graphics
				width  : PropTypes.number,
				height : PropTypes.number,
				name   : PropTypes.string.isRequired
			}))
			.isRequired
		}),

		style     : PropTypes.object,
		className : PropTypes.string
	}

	render()
	{
		const { user, picture, style, className } = this.props

		let sizes

		if (picture)
		{
			sizes = picture.sizes
		}
		else if (user.picture_sizes)
		{
			sizes = user.picture_sizes
		}

		return <Image
			ref={ref => this.image = ref}
			style={style}
			className={classNames('user-picture', className)}
			type={picture ? undefined : "user_picture"}
			max_width={1000}
			sizes={sizes}
			src={sizes ? undefined : require('../../assets/images/user picture.png')}/>
	}

	width()
	{
		return this.image.width()
	}
}