import React, { PropTypes, Component } from 'react'
import classNames from 'classnames'
// import { connect } from 'react-redux'
import { Form } from 'react-responsive-ui'
import Redux_form from 'simpler-redux-form'

import { defineMessages } from 'react-intl'

import Submit from '../../../components/form/submit'

import international from '../../../international/internationalize'

import Text_input     from '../../../components/form/text input'
import Select         from '../../../components/form/select'

// import
// {
// 	update_poster
// }
// from '../../../redux/poster/profile'

// @connect
// (
// 	undefined,
// 	{
// 		update_poster
// 	}
// )

@international
export class PersonalInfo extends Component
{
	render()
	{
		const
		{
			poster,
			translate
		}
		= this.props

		const markup =
		(
			<div className={ classNames('poster-info') }>
				{/* User's name
				<h1
					style={ styles.poster_name }
					className="poster-info__name">
					{ poster.name }
				</h1>
				*/}

				{/* Poster's description */}
				{ poster.data.description &&
					<div className="poster-info__description">
						{ poster.data.description }
					</div>
				}

				{/* Poster's place and country */}
				{ (poster.place || poster.country) &&
					<div className="poster-info__location">
						{ this.whereabouts().join(', ') }
					</div>
				}
			</div>
		)

		return markup
	}

	// User's [place, country]
	whereabouts()
	{
		const { poster, translate } = this.props

		const whereabouts = []

		if (poster.place)
		{
			whereabouts.push(poster.place)
		}

		if (poster.country)
		{
			whereabouts.push(translate({ id: `country.${poster.country}` }))
		}

		return whereabouts
	}
}

@international
@Redux_form
export class PersonalInfoForm extends Component
{
	static contextTypes =
	{
		intl: PropTypes.object
	}

	static propTypes =
	{
		poster   : PropTypes.object.isRequired,
		busy     : PropTypes.bool,
		onSubmit : PropTypes.func.isRequired,
		storeSubmitButton : PropTypes.func.isRequired
	}

	constructor(props, context)
	{
		super(props, context)

		// Fill two-letter country codes list

		this.countries = []

		for (let key of Object.keys(context.intl.messages))
		{
			if (key.starts_with('country.'))
			{
				key = key.substring('country.'.length)
				if (key.length === 2)
				{
					this.countries.push(key)
				}
			}
		}

		this.countries = this.countries.filter(code => code !== 'ZZ')
			.map(code =>
			({
				value: code,
				label: context.intl.messages[`country.${code}`]
			}))
			.sort((a, b) => a.label.localeCompare(b.label, props.locale))
	}

	render()
	{
		const
		{
			poster,
			busy,
			onSubmit,
			submit,
			submitting,
			storeSubmitButton,
			translate,
			children
		}
		= this.props

		const markup =
		(
			<Form
				busy={ busy }
				submit={ submit(onSubmit) }
				className={ classNames('poster-info', 'poster-info--editing') }>

				{/* Form errors */}
				{ children }

				{/* Form fields */}
				<div className="rrui__form__fields">
					{/* Edit poster's name */}
					<Text_input
						name="name"
						label={ translate(messages.name) }
						value={ poster.name }
						validate={ this.validate_name }/>

					{/* Edit poster's description */}
					<Text_input
						name="description"
						label={ translate(messages.description) }
						value={ poster.data.description }/>

					{/* Edit poster's place (e.g. "Moscow") */}
					{/* City, town, etc */}
					<Text_input
						name="place"
						label={ translate(messages.place) }
						disabled={ submitting }
						value={ poster.place }/>

					{/* Edit poster's country (e.g. "Russia") */}
					{/* Country */}
					<Select
						autocomplete
						autocompleteShowAll
						name="country"
						label={ translate(messages.country) }
						disabled={ submitting }
						options={ this.countries }
						value={ poster.country }/>
				</div>

				{/* Form submit button */}
				<Submit ref={ storeSubmitButton }/>
			</Form>
		)

		return markup
	}

	validate_name = (value) =>
	{
		const { translate } = this.props

		if (!value)
		{
			return translate(messages.name_is_required)
		}
	}
}

const messages = defineMessages
({
	name:
	{
		id             : `poster.profile.name`,
		description    : `Poster's name`,
		defaultMessage : `Name`
	},
	description:
	{
		id             : `poster.profile.description`,
		description    : `Poster's description`,
		defaultMessage : `Description`
	},
	place:
	{
		id             : `poster.profile.place`,
		description    : `Poster's place of living`,
		defaultMessage : `Place`
	},
	country:
	{
		id             : `poster.profile.country`,
		description    : `Poster's country`,
		defaultMessage : `Choose your country`
	},
	name_is_required:
	{
		id             : `poster.profile.name_is_required`,
		description    : `The poster tried to save his profile with a blank "name" field`,
		defaultMessage : `Enter your name`
	}
})