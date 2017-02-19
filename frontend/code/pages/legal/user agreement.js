import React, { Component } from 'react'
import { withRouter } from 'react-router'

import ru from '../../../assets/user-agreement/ru.md'
import en from '../../../assets/user-agreement/en.md'

const user_agreement =
{
	ru,
	en
}

@withRouter
export default class User_agreement extends Component
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
					dangerouslySetInnerHTML={ { __html: user_agreement[language] } }/>
			</section>
		)

		return markup
	}
}

export function most_suitable_language(language)
{
	if (user_agreement[language])
	{
		return language
	}

	if (user_agreement.en)
	{
		return 'en'
	}

	return Object.keys(user_agreement)[0]
}