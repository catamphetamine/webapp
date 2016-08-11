import React, { Component, PropTypes } from 'react'
import styler from 'react-styling'
import classNames from 'classnames'

export default class Content_section extends Component
{
	static propTypes =
	{
		title: PropTypes.string,
		padding: PropTypes.bool,
		children: PropTypes.node
	}

	render()
	{
		const { title, padding, className, children } = this.props

		const markup =
		(
			<section
				className={classNames
				(
					'content-section',
					{ 'content-section--no-padding': padding === false }
				)}>

				{ title && <h2 className="content-section-header">{title}</h2> }

				{children}
			</section>
		)

		return markup
	}
}