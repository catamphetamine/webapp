import React, { Component, PropTypes } from 'react'
import { connect }                     from 'react-redux'
import { defineMessages }              from 'react-intl'
import { redirect }                    from 'react-isomorphic-render'

import international from '../../../international/internationalize'

import Editable_field  from '../../../components/editable field'

import
{
	change_alias,
	reset_change_alias_error
}
from '../../../redux/user/settings/main'

@connect
(
	undefined,
	{
		change_alias,
		reset_change_alias_error,
		snack,
		redirect
	}
)
@international
export default class Poster_alias extends Component
{
	static propTypes =
	{
		poster : PropTypes.object.isRequired
	}

	constructor()
	{
		super()

		this.update_alias = this.update_alias.bind(this)
	}

	render()
	{
		const
		{
			poster,
			change_alias_error,
			reset_change_alias_error
		}
		= this.props

		const markup =
		(
			<Editable_field
				name="alias"
				label={ translate(messages.alias) }
				hint={ translate(messages.alias_hint) }
				value={ poster.alias }
				validate={ this.validate_alias }
				save={ this.update_alias }
				cancel={ reset_change_alias_error }
				error={ this.change_alias_error_message(change_alias_error) }/>
		)

		return markup
	}

	validate_alias = (value) =>
	{
		const { translate } = this.props

		if (!value)
		{
			return translate(messages.enter_alias)
		}
	}

	async update_alias(alias)
	{
		try
		{
			const { change_alias, translate, snack, redirect } = this.props

			await change_alias(poster.id, alias)

			snack(translate(messages.alias_updated))

			redirect(`/${alias}`)
		}
		catch (error)
		{
			console.error(error)
			throw error
		}
	}

	change_alias_error_message(error)
	{
		const { translate } = this.props

		if (!error)
		{
			return
		}

		if (error.status === http_status_codes.Conflict)
		{
			return translate(messages.alias_already_taken)
		}

		if (error.message === 'Invalid alias')
		{
			return translate(messages.invalid_alias)
		}

		if (error.message === 'Max aliases reached')
		{
			return translate(messages.max_aliases_reached)
		}

		return translate(messages.change_alias_failed)
	}
}

const messages = defineMessages
({
	alias:
	{
		id             : 'user.settings.alias',
		description    : `User's alias, which is a unique human-readable identifier used in user's URL`,
		defaultMessage : `Alias`
	},
	alias_hint:
	{
		id             : 'user.settings.alias.hint',
		description    : `A hint on user's alias, which is a unique human-readable identifier used in user's URL`,
		defaultMessage : `An "alias" is a unique textual identifier used as part of your profile page URL`
	},
	enter_alias:
	{
		id             : 'user.settings.alias.required',
		description    : `An error message stating that new alias hasn't been entered`,
		defaultMessage : `Enter alias`
	},
	alias_updated:
	{
		id             : 'user.settings.alias.updated',
		description    : `User's new alias has been saved`,
		defaultMessage : `Alias updated`
	},
	change_alias_failed:
	{
		id             : 'user.settings.alias.update_failed',
		description    : `An error stating that the user's alias couldn't be changed to the new one`,
		defaultMessage : `Couldn't update your alias`
	},
	alias_already_taken:
	{
		id             : 'user.settings.alias.already_taken',
		description    : `An error stating that the desired alias is already taken`,
		defaultMessage : `This alias is already taken`
	},
	invalid_alias:
	{
		id             : 'user.settings.alias.invalid',
		description    : `An error stating that the desired alias is invalid (maybe is digits-only, or something else)`,
		defaultMessage : `Not a valid alias`
	},
	max_aliases_reached:
	{
		id             : 'user.settings.alias.max_aliases_reached',
		description    : `An error stating that the user has occupied too much aliases and more aliases per user aren't allowed`,
		defaultMessage : `You have already too many aliases`
	}
})