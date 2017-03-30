import { defineMessages } from 'react-intl'

export default defineMessages
({
	save:
	{
		id             : 'action.save',
		description    : 'Save action title',
		defaultMessage : 'Save'
	},
	cancel:
	{
		id             : 'action.cancel',
		description    : 'Cancel action title',
		defaultMessage : 'Cancel'
	},
	next:
	{
		id             : 'action.next',
		description    : 'Next step action title',
		defaultMessage : 'Next'
	},
	done:
	{
		id             : 'action.done',
		description    : '"All done" action title',
		defaultMessage : 'Done'
	},
	understood:
	{
		id             : 'action.understood',
		description    : '"Got it" action title',
		defaultMessage : 'OK'
	},
	change:
	{
		id             : 'action.change',
		description    : 'Change action title',
		defaultMessage : 'Change'
	},
	error:
	{
		id             : 'error.generic',
		description    : 'Generic error text',
		defaultMessage : 'Error'
	},
	settings:
	{
		id             : 'settings',
		description    : 'Generic settings button text',
		defaultMessage : 'Settings'
	},
	picture_upload_error:
	{
		id             : `upload.picture.error`,
		description    : `Failed to upload user picture`,
		defaultMessage : `Couldn't process the picture`
	},
	picture_upload_too_big_error:
	{
		id             : `upload.picture.error.too_big`,
		description    : `The image user tried to upload is too big`,
		defaultMessage : `The image file you tried to upload is too big. Only images up to 10 Megabytes are allowed.`
	},
	picture_upload_unsupported_file_error:
	{
		id             : `upload.picture.error.unsupported_file`,
		description    : `The image user tried to upload is of an unsupported file format`,
		defaultMessage : `The file you tried to upload is not supported for user pictures. Only JPG, PNG and SVG images are supported.`
	},
})