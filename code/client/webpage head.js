import DocumentMeta from 'react-document-meta'
// import Helmet from 'react-helmet'

// fixes strange bug: "ReferenceError: React is not defined"
import React from 'react'

export function webpage_title(title)
{
	return <DocumentMeta title={title}/>
	// return <Helmet title={title}/>
}

export function webpage_head(title, description, meta)
{
	const metadata =
	{
		title,
		description,
		meta
	}

	return <DocumentMeta {...metadata}/>

	// const metadata = 
	// {
	// 	description
	// }

	// for (let key of meta)
	// {
	// 	if (key === 'property')
	// 	{
	// 		for (let key of meta.property)
	// 		{
	// 			metadata.push({ property: key, content: meta.property[key] })
	// 		}
	// 	}
	// 	else
	// 	{
	// 		metadata.push({ name: key, content: meta[key] })
	// 	}
	// }

	// return <Helmet title={title} meta={metadata}/>
}

export function server_generated_webpage_head()
{
	return DocumentMeta.renderAsReact()

	// const head = Helmet.rewind()

	// const markup = 
	// (
	// 	<meta charset="utf-8" />
	// 	<title>{head.title}</title>
	// 	{head.meta}
	// 	{head.link}
	// )

	// return markup
}