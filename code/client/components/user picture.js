import React, { PropTypes } from 'react'
import classNames from 'classnames'

import Image from './image'

export default class User_picture extends React.Component
{
	static propTypes =
	{
		user : PropTypes.shape
		({
			picture : PropTypes.shape
			({
				sizes : PropTypes.arrayOf(PropTypes.shape
				({
					// `width` is not required for vector graphics
					width : PropTypes.number,
					name  : PropTypes.string.isRequired
				}))
				.isRequired
			})
		})
		.isRequired,

		picture : PropTypes.shape
		({
			sizes : PropTypes.arrayOf(PropTypes.shape
			({
				width : PropTypes.number.isRequired,
				name  : PropTypes.string.isRequired
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
		else if (user.picture)
		{
			sizes = user.picture.sizes
		}

		return <Image
			ref="image"
			style={style}
			className={classNames('user-picture', className)}
			type="user_picture"
			max_width={1000}
			sizes={sizes}
			src={sizes ? undefined : require('../../../assets/images/user picture.png')}/>
	}

	width()
	{
		return this.refs.image.width()
	}
}