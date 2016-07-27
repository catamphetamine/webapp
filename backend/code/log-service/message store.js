export default
{
	messages: [],

	max: 1000,

	add: function(message)
	{
		if (this.messages.length === this.max)
		{
			this.messages.shift()
		}

		this.messages.push(message)
	}
}