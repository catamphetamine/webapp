import React, { Component } from 'react'
import { withRouter } from 'react-router'

import ru from '../../../assets/privacy-policy/ru.md'
import en from '../../../assets/privacy-policy/en.md'

const privacy_policy =
{
	ru,
	en
}

@withRouter
export default class Privacy_policy extends Component
{
	render()
	{
		const
		{
			router:
			{
				params:
				{
					language
				}
			}
		}
		= this.props

		const markup =
		(
			<section className="content">
				<div
					className="page__text-content"
					dangerouslySetInnerHTML={ { __html: privacy_policy[language] } }/>
			</section>
		)

		return markup
	}
}

export function most_suitable_language(language)
{
	if (privacy_policy[language])
	{
		return language
	}

	return 'en'
}