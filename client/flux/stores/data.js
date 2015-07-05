import React from 'react'
import Bus from '../bus'
import { Store } from './../../scripts/libraries/reacto'

const Data = Store
({
	helper_method: function()
	{
		console.log('some helper method here')
	}
})

Data.listen(Bus,
{
	settings: (data) =>
	{
		Data.settings = data
		Data.notify('settings_changed')
	}
})

export default Data