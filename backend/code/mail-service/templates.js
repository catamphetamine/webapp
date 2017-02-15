import path from 'path'
import fs from 'fs'
import { merge } from 'lodash'
// Nunjucks is a fast and easy templating language created by Mozilla
// https://mozilla.github.io/nunjucks/templating.html
import nunjucks from 'nunjucks'
// Uses juice, which takes an HTML file
// and inlines all the <link rel="stylesheet">s and the <style>s.
import juice from 'juice'
// Infers plain text from HTML markup
import html_to_text from 'html-to-text'
// `bluebird` are the best promises
import Promise from 'bluebird'
Promise.promisifyAll(juice)

export default class EmailTemplates
{
	constructor(options = {})
	{
		this.options = merge
		({
			juice:
			{
				webResources:
				{
					relativeTo: options.root
				}
			}
		},
		options)

		const loader = new nunjucks.FileSystemLoader(this.options.root,
		{
			watch   : process.env.NODE_ENV !== 'production',
			noCache : process.env.NODE_ENV !== 'production'
		})

		this.environment = new nunjucks.Environment(loader,
		{
			// Some people may prefer autoescaping set to `true`
			// while I'm inlining HTML in the form of variables
			// therefore `autoescaping` is set to `false`
			// (this opens a small window for theoretically possible XSS attacks)
			autoescape : false
		})
	}

	// Internal helper
	async _render(filename, context)
	{
		const file_path = path.join(this.options.root, filename)
		const exists = await fs_exists(file_path)
		if (exists)
		{
			return this.environment.render(filename, context)
		}
	}

	// Public API
	async render(name, context = {})
	{
		let html = this.environment.render(`${name}.html`, context)

		// Inline resources
		html = await juice.juiceResourcesAsync(html, this.options.juice)

		const text = await this._render(`${name}.txt`, context) || html_to_text.fromString(html)

		const subject = await this._render(`${name}.subject.txt`, context)

		return { html, text, subject }
	}
}

// checks if filesystem path exists
function fs_exists(path)
{
	return new Promise((resolve, reject) =>
	{
		fs.exists(path, exists => resolve(exists))
	})
}