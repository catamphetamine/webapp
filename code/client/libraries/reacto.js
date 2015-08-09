import { EventEmitter } from 'events'

export function Store(object, dispatcher)
{
	return Object.merge(EventEmitter.prototype, object, 
	{
		on: function(event, listener) 
		{
			this.addListener(event, listener)
			return () => this.removeListener(event, listener)
		},

		notify: function(event)
		{
			return this.emit(event)
		},

		listen: function(dispatcher, events)
		{
			return dispatch(dispatcher, events)
		}

		// off: (event, listener) ->
		// 	@removeListener(event, listener)
	})
}

export function dispatch(dispatcher, handlers)
{
	return dispatcher.register((incoming) =>
	{
		if (handlers[incoming.event]) 
		{
			handlers[incoming.event](incoming.data, incoming)
		}
		else
		{
			console.warn(`Warning: Unknown event: ${incoming.event}`)
		}
	})
}