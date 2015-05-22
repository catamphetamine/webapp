module.exports = (React) ->
	EventEmitter = require('events').EventEmitter

	React.Store = (object, dispatcher) ->
		Object.merge(EventEmitter.prototype, object, {
			on: (event, listener) ->
				@addListener(event, listener)
				=> @removeListener(event, listener)

			notify: (event) ->
				@emit(event)

			listen: (dispatcher, events) ->
				React.dispatch(dispatcher, events)

			# off: (event, listener) ->
			# 	@removeListener(event, listener)
		})

	React.dispatch = (dispatcher, handlers) ->
		dispatcher.register (incoming) ->
			if handlers[incoming.event]
				handlers[incoming.event](incoming.data, incoming)
			else
				console.warn "Warning: Unknown event: #{incoming.event}"