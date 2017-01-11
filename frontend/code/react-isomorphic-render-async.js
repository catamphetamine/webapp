export default
{
	// When supplying `event` instead of `events`
	// as part of an asynchronous Redux action
	// this will generate `events` from `event`
	// using this function.
	// The optional fourth element is the reset error event name,
	// i.e. the event which is gonna reset an error,
	// and is only needed in some rare cases, so it may just be skipped.
	asynchronous_action_event_naming: event =>
	([
		`${event}: pending`,
		`${event}: done`,
		`${event}: error`
	]),

	// When using `asynchronousActionHandler`
	// this function will generate a Redux state property name from an event name.
	// E.g. event `GET_USERS_ERROR` => state.`getUsersError`.
	asynchronous_action_handler_state_property_naming(event)
	{
		// Converts `event name: modifier` to `event_name_modifier`
		return event.replace(/\s/g, '_').replace(/:/g, '')
	}
}