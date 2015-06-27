import React from 'react'
import Bus from '../bus'
import Reacter from './../../scripts/libraries/react'

const Data = Reacter.Store
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