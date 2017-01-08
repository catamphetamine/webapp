import { Preload_started, Preload_finished, Preload_failed } from 'react-isomorphic-render'

export const preload_started = () =>
({
	type      : Preload_started,
	immediate : true
})