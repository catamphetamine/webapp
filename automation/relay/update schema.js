#!/usr/bin/env babel-node --optional es7.asyncFunctions

import path from 'path'
import fs from 'fs-extra'
import { Schema } from '../../code/schema'
import { graphql }  from 'graphql'
import { introspectionQuery as introspection_query, printSchema as print_schema } from 'graphql/utilities'

// Save JSON of full schema introspection for Babel Relay Plugin to use
const save_json = async () => 
{
	const result = await (graphql(Schema, introspection_query))
	if (result.errors)
	{
		console.error
		(
			'ERROR introspecting schema: ',
			JSON.stringify(result.errors, null, 2)
		)
	}
	else
	{
		fs.outputFileSync
		(
			path.join(__dirname, '../../build/relay schema.json'),
			JSON.stringify(result, null, 2)
		)
	}
}

save_json()

// Save user readable type system shorthand of schema
fs.outputFileSync
(
	path.join(__dirname, '../../build/schema.graphql'),
	print_schema(Schema)
)