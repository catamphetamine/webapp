import React from 'react'
import Bus from '../bus'

const Data = React.Store
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