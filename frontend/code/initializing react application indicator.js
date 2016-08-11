export default
{
	// Shows "Initializing React application" spinner
	show()
	{
		document.addEventListener('DOMContentLoaded', function(event)
		{
			const initializing_react_application = document.querySelector('.initializing-react-application')
			initializing_react_application.classList.add('initializing-react-application--enabled')
			initializing_react_application.classList.add('initializing-react-application--shown')
		})
	},

	// Hides "Initializing React application" spinner
	hide()
	{
		const spinner = document.querySelector('.initializing-react-application')
		spinner.classList.remove('initializing-react-application--shown')
		setTimeout(() =>
		{
			spinner.classList.remove('initializing-react-application--enabled')
		},
		1000)
	}
}
