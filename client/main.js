import Promise from 'bluebird'
import Standard_promise from 'babel-runtime/core-js/promise'
Standard_promise.default = Promise

import _ from './scripts/libraries/language'

if (_development_)
{
	Promise.longStackTraces()
}

import './application'