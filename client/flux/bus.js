import { Dispatcher as Bus } from 'flux'

Bus.prototype.push = function(event, data)
{
	this.dispatch
	({
		event : event,
		data  : data
	})
}

export default new Bus()