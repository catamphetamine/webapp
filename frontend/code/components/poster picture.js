import React, { PropTypes } from 'react'
import classNames from 'classnames'

import Image from './image'

const picture_size = PropTypes.shape
({
	// `width` and `height` are not required for vector graphics
	width  : PropTypes.number,
	height : PropTypes.number,
	name   : PropTypes.string.isRequired
})

export default class Poster_picture extends React.Component
{
	static propTypes =
	{
		poster : PropTypes.shape
		({
			picture : PropTypes.shape
			({
				sizes : PropTypes.arrayOf(picture_size).isRequired
			})
		})
		.isRequired,

		picture : PropTypes.shape
		({
			sizes : PropTypes.arrayOf(picture_size).isRequired
		}),

		style     : PropTypes.object,
		className : PropTypes.string
	}

	render()
	{
		const { poster, picture, style, className } = this.props

		let sizes

		if (picture)
		{
			sizes = picture.sizes
		}
		else if (poster.picture)
		{
			sizes = poster.picture.sizes
		}

		return <Image
			ref={ ref => this.image = ref }
			style={ style }
			className={ classNames('user-picture', className) }
			type={ picture ? undefined : 'poster_picture' }
			max_width={ 1000 }
			sizes={ sizes }
			src={ sizes ? undefined : require('../../assets/images/poster picture.png') }/>
	}

	width()
	{
		return this.image.width()
	}
}