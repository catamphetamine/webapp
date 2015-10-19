import React, { Component, PropTypes } from 'react'
import { webpage_title } from '../../webpage head'
import styler from 'react-styling'
import { connect } from 'react-redux'
import { bindActionCreators as bind_action_creators } from 'redux'
import { get as get_users, add as add_user, remove as delete_user } from '../../actions/users'

@connect
(
	store => 
	({
		users   : store.users.data,
		loading : store.users.loading,
		loaded  : store.users.loaded,
		stale   : store.users.stale,
		error   : store.users.error
	}),
	dispatch => bind_action_creators({ get_users, add_user, delete_user }, dispatch)
)
export default class Page extends Component
{
	static propTypes =
	{
		get_users     : PropTypes.func.isRequired,
		add_user      : PropTypes.func.isRequired,
		delete_user   : PropTypes.func.isRequired,
		users         : PropTypes.array,
		loading       : PropTypes.bool,
		loaded        : PropTypes.bool,
		stale         : PropTypes.bool,
		error         : PropTypes.object
	}

	static contextTypes =
	{
		store : PropTypes.object.isRequired
	}

	constructor(props)
	{
		super(props)

		this.refresh     = this.refresh.bind(this)
		this.add_user    = this.add_user.bind(this)
		this.delete_user = this.delete_user.bind(this)
	}

	componentDidMount()
	{
		// to do: remove second loading here for client-side navigation
		// to do: remove loading here for server-side rendered page
		if (window.client_side_routing)
		{
			this.constructor.preload(this.context.store)
		}
	}

	componentWillReceiveProps(next_props)
	{
		if (!this.props.stale && next_props.stale)
		{
			this.refresh()
		}
	}

	// shouldComponentUpdate(next_props, next_state)
	// {
	// 	// may skip rendering if next_props = props + stale: true
	// }

	render()
	{
		const { error, loaded, users } = this.props

		if (error)
		{
			const markup = 
			(
				<section className="content">
					{webpage_title("Simple REST API example")}

					<p>Error: {error.stack || error}</p>
				</section>
			)

			return markup
		}

		const markup = 
		(
			<section className="content">
				{webpage_title("Simple REST API example")}

				<div style={style.container}>
					<p>This is an example of REST API usage with no database persistence</p>

					{this.render_users(loaded, users)}
				</div>
			</section>
		)

		return markup
	}

	render_users(loaded, users)
	{
		if (!loaded)
		{
			return <div style={style.users}>Loading users</div>
		}

		if (users.is_empty())
		{
			const markup = 
			(
				<div style={style.users}>
					No users

					<button onClick={this.add_user} style={style.users.add}>Add user</button>

					<button onClick={this.refresh} style={style.users.refresh}>Refresh</button>
				</div>
			)

			return markup
		}

		const markup = 
		(
			<div style={style.users}>
				Users

				<button onClick={this.add_user} style={style.users.add}>Add user</button>
				
				<button onClick={this.refresh} style={style.users.refresh}>Refresh</button>

				<div>
					<ul style={style.users.list}>
						{users.map(user =>
						{
							return <li key={user.id}>
								#{user.id} {user.name}
								<button onClick={event => this.delete_user(user.id)} style={style.users.delete}>delete</button>
							</li>
						})}
					</ul>
				</div>
			</div>
		)

		return markup
	}

	refresh()
	{
		this.props.get_users()
	}

	add_user()
	{
		const name = prompt(`Enter user's name`)
		
		if (!name)
		{
			return
		}

		this.props.add_user({ name: name })

		// this.refresh()
	}

	delete_user(id)
	{
		this.props.delete_user(id)

		// this.refresh()
	}

	static preload(store)
	{
		const promises = []

		// if (!are_settings_loaded(store.getState()))
		// {
			promises.push(store.dispatch(get_users()))
		// }

		return Promise.all(promises)
	}
}

const style = styler
`
	container

	users
		margin-top : 2em

		list
			display         : inline-block
			list-style-type : none
			padding-left    : 1em

		refresh
			margin-left : 0.5em

		add
			margin-left : 1em

		delete
			margin-left : 1em
			float       : right
`