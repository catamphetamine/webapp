/* global _devtools_ */
import 'babel/polyfill'

import language       from '../language'

import React          from 'react'
import BrowserHistory from 'react-router/lib/BrowserHistory'

import api_client     from './api client'
import { client }     from '../react-isomorphic-render'
import create_store   from './redux/store'
import routes         from './routes'

// include these resources in webpack build
import styling from '../../client/styles/style.scss'
import webpage_icon from '../../client/images/icon/32x32.png'

React.initializeTouchEvents(true)

client
({
	development       : _development_,
	development_tools : _devtools_,
	routes            : routes,
	history           : new BrowserHistory(),
	store             : create_store(new api_client(), window._flux_store_data),
	content_container : document.getElementById('content')
})