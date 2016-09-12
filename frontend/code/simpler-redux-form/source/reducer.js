export default function reducer(state = {}, action)
{
	// Temporary debugging
	// console.log('Action', action)
	// console.log('Previous state', state)

	const form_state = state[action.form]

	switch (action.type)
	{
		case '@@simpler-redux-form/initialize':

			// It will have been already initialized on the server-side
			// if (state[action.form] !== undefined)
			// {
			// 	throw new Error(`Form "${action.form}" has already been initialized.`)
			// }

			state =
			{
				...state,
				[action.form] : initial_form_state()
			}

			return state

		case '@@simpler-redux-form/destroy':

			// if (state[action.form] === undefined)
			// {
			// 	throw new Error(`Form "${action.form}" has already been destroyed.`)
			// }

			state = { ...state }

			delete state[action.form]

			return state

		case '@@simpler-redux-form/register-field':

			state = { ...state }

			// Uses a numerical counter instead of a boolean.
			// https://github.com/erikras/redux-form/issues/1705
			if (form_state.fields[action.field] === undefined)
			{
				form_state.fields[action.field] = 1

				// Only initializes the field with it's default value
				// if it hasn't been seen before.
				form_state.values[action.field] = action.value
				form_state.errors[action.field] = action.error

				// If an external error was specified, then show it
				if (action.non_validation_error)
				{
					form_state.indicate_invalid[action.field] = true
				}
			}
			else
			{
				form_state.fields[action.field]++
			}

			return state

		case '@@simpler-redux-form/unregister-field':

			// Seems that a form gets destroyed before its fields
			if (form_state)
			{
				state = { ...state }

				if (!form_state.fields[action.field])
				{
					console.error(`Warning: An "unregister field" request was sent for field "${action.field}" which is not currently registered. This is a bug and it needs to be reported: https://github.com/halt-hammerzeit/simpler-redux-form/issues`)
				}

				// Uses a numerical counter instead of a boolean.
				// https://github.com/erikras/redux-form/issues/1705
				form_state.fields[action.field]--
			}

			return state

		case '@@simpler-redux-form/changed':

			// This changes [action.form] object's properties,
			// and therefore Redux'es shallow compare
			// rerenders the form every time.
			//
			// state =
			// {
			// 	...state,
			// 	[action.form]:
			// 	{
			// 		...form_state,
			// 		values:
			// 		{
			// 			...form_state.values,
			// 			[action.field] : action.value
			// 		},
			// 		errors:
			// 		{
			// 			...form_state.errors,
			// 			[action.field] : action.error
			// 		},
			// 		indicate_invalid:
			// 		{
			// 			...form_state.indicate_invalid,
			// 			[action.field] : false
			// 		}
			// 	}
			// }

			state = { ...state }

			form_state.values[action.field]           = action.value
			form_state.errors[action.field]           = action.error
			form_state.indicate_invalid[action.field] = false

			return state

		case '@@simpler-redux-form/indicate-invalid':

			// This changes [action.form] object's properties,
			// and therefore Redux'es shallow compare
			// rerenders the form every time.
			//
			// state =
			// {
			// 	...state,
			// 	[action.form]:
			// 	{
			// 		...form_state,
			// 		indicate_invalid:
			// 		{
			// 			...form_state.indicate_invalid,
			// 			[action.field] : true
			// 		}
			// 	}
			// }

			state = { ...state }

			form_state.indicate_invalid[action.field] = true

			return state

		case '@@simpler-redux-form/dont-indicate-invalid':

			state = { ...state }

			form_state.indicate_invalid[action.field] = false

			return state

		case '@@simpler-redux-form/clear':

			state = { ...state }

			form_state.values[action.field]           = undefined
			form_state.errors[action.field]           = action.error
			form_state.indicate_invalid[action.field] = action.error ? true : false

			return state

		case '@@simpler-redux-form/focus':

			// This changes [action.form] object's properties,
			// and therefore Redux'es shallow compare
			// rerenders the form every time.
			//
			// state =
			// {
			// 	...state,
			// 	[action.form]:
			// 	{
			// 		...form_state,
			// 		focus:
			// 		{
			// 			[action.field] : true
			// 		}
			// 	}
			// }

			state = { ...state }

			for (let field of Object.keys(form_state.focus))
			{
				delete form_state.focus[field]
			}

			form_state.focus[action.field] = true

			return state

		case '@@simpler-redux-form/focused':

			state = { ...state }

			for (let field of Object.keys(form_state.focus))
			{
				delete form_state.focus[field]
			}

			return state

		case '@@simpler-redux-form/validation-passed':

			state = { ...state }

			form_state.misc.validation_failed = !action.passed

			return state

		case '@@simpler-redux-form/reset-invalid-indication':

			state = { ...state }

			for (let field of Object.keys(form_state.indicate_invalid))
			{
				form_state.indicate_invalid[field] = false
				// delete form_state.indicate_invalid[field]
			}

			form_state.misc.validation_failed = false

			return state

		default:
			return state
	}
}

export function initial_form_state()
{
	const state =
	{
		fields           : {},
		values           : {},
		errors           : {},
		indicate_invalid : {},
		focus            : {},
		misc             : {}
	}

	return state
}