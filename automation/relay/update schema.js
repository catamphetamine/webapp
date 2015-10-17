#!/usr/bin/env babel-node --optional es7.asyncFunctions

import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import { Schema } from '../../code/schema'
import { graphql }  from 'graphql'
import { introspectionQuery as introspection_query, printSchema as print_schema } from 'graphql/utilities'

// Save JSON of full schema introspection for Babel Relay Plugin to use
async () => 
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
		fs.writeFileSync
		(
			path.join(__dirname, '../../build/relay schema.json'),
			JSON.stringify(result, null, 2)
		)
	}
}()

const schema_path = path.join(__dirname, '../../build/schema.graphql')

mkdirp.sync(path.dirname(schema_path))

// Save user readable type system shorthand of schema
fs.writeFileSync
(
	schema_path,
	print_schema(Schema)
)