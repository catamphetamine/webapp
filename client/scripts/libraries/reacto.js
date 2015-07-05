import { EventEmitter } from 'events'

export function Store(object, dispatcher)
{
	return Object.merge(EventEmitter.prototype, object, 
	{
		on: function(event, listener) 
		{
			this.addListener(event, listener)
			return () => this.removeListener(event, listener)
		},

		notify: function(event)
		{
			return this.emit(event)
		},

		listen: function(dispatcher, events)
		{
			return dispatch(dispatcher, events)
		}

		// off: (event, listener) ->
		// 	@removeListener(event, listener)
	})
}

export function dispatch(dispatcher, handlers)
{
	return dispatcher.register((incoming) =>
	{
		if (handlers[incoming.event]) 
		{
			handlers[incoming.event](incoming.data, incoming)
		}
		else
		{
			console.warn(`Warning: Unknown event: ${incoming.event}`)
		}
	})
}

export function styler(styles)
{
	if (typeof(styles) === 'string')
	{
		function split_into_blocks(text)
		{
			// console.log('@@@@@@@', text)
			// alert('recurse')

			const blocks = {}

			let block_key = null
			let block = null
			let styles = null

			const lines = text.split('\n')
			lines.push('\t$')

			let scanline_indentation = 0
			for (let line of lines)
			{
				let trimmed_line = line

				let line_indentation = 0
				while (trimmed_line[0] === '\t')
				{
					line_indentation++
					trimmed_line = trimmed_line.substring(1)
				}

				trimmed_line = trimmed_line.trim()

				if (trimmed_line.is_blank())
				{
					continue
				}

				if (trimmed_line === '$')
				{
					line = line.substring(0, line.length - 1)
					trimmed_line = trimmed_line.substring(0, trimmed_line.length - 1)
				}

				// console.log('line_indentation', line_indentation, 'scanline_indentation', scanline_indentation)

				if (line_indentation === 1)
				{
					if (trimmed_line.ends_with(':'))
					{
						trimmed_line = trimmed_line.substring(0, trimmed_line.length - ':'.length)
						// throw new Error(`Remove the trailing colon at line: ${line}`)
					}

					if (block != null)
					{
						// console.log(block)

						const object = split_into_blocks(block.join('\n'))

						object._ = {}
						for (let style of styles)
						{
							const key = style.before(':').trim()
							const value = style.after(':').trim()
							object._[key] = value
						}

						blocks[block_key] = object

						block_key = null
						block = null
						styles = null
					}

					// alert('block created')

					block_key = trimmed_line
					styles = []
					block = []
				}
				else if (line_indentation === 2)
				{
					if (line.has(':'))
					{
						styles.push(line.substring(2))
						continue
					}
				}
				
				if (line_indentation > 1)
				{
					if (line_indentation === scanline_indentation + 1)
					{
						block.push(line.substring(1))
						scanline_indentation = line_indentation
					}
					else if (line_indentation === scanline_indentation - 1)
					{
						block.push(line.substring(1))
						scanline_indentation = line_indentation
					}
					else if (line_indentation === scanline_indentation)
					{
						block.push(line.substring(1))
					}
					else
					{
						// throw new Error(`Invalid indentation at line: ${line}`)
						throw new Error(`Invalid indentation at line: ${line}. line_indentation: ${line_indentation}, scanline_indentation: ${scanline_indentation}`)
					}
				}
				else
				{
					scanline_indentation = line_indentation
				}
			}

			return blocks
		}

		// add tabulation
		// styles = styles.split('\n').map(line => `\t${line}`).join('\n')
		styles = split_into_blocks(styles)

		// console.log(styles)
	}

	return function(path, modifier)
	{
		const paths = path.split(' ')
		const style = Object.get_value_at_path(styles, paths)
		let result = exists(style._) ? style._ : style

		if (exists(modifier))
		{
			if (no(style._))
			{
				throw new Error(`Style "${path}" called with modifier "${modifier}" but has no "_" property`)
			}

			if (no(style[modifier]._))
			{
				throw new Error(`Style "${path}" has no default style for modifier "${modifier}"`)
			}

			result = merge(result, style[modifier]._)
		}

		const canonical = {}

		for (let key of Object.keys(result))
		{
			// const canonical_key = key.replace(/([\s]{1}[a-z]{1}|[-]{1}[a-z]{1})/g, character => character.substring(1).toUpperCase())
			const canonical_key = key.replace(/([-]{1}[a-z]{1})/g, character => character.substring(1).toUpperCase())
			canonical[canonical_key] = result[key]
		}

		return canonical
	}
}