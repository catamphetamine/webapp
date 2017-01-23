export default function(api)
{
	api.post('/notification', async function({ type }, { user })
	{
		console.log('@@@ Notify', type, user)
	})
}