import path from 'path'

export default function html_stack_trace(stack_trace)
{
	const lines = stack_trace.split('\n').map(line => line.trim())

	function escape_html(text)
	{
		return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
	}

	const groups = []
	let group

	for (let line of lines)
	{
		if (!line.starts_with('at'))
		{
			line = line.replace(/^Error: /, '')

			group = { title: line, lines: [] }
			groups.push(group)
		}
		else
		{
			line = line.replace(/at /, '')

			const line_parts = line.match(/^(.*) \((.*):(\d+):(\d+)\)$/)

			if (line_parts)
			{
				const method_path      = line_parts[1]
				const file_path        = line_parts[2]
				const file_line_number = line_parts[3]

				line = 
				`
					<span class="file-path">${escape_html(path.basename(file_path))}</span><!--
					--><span class="colon">:</span><!--
					--><span class="line-number">${file_line_number}</span>
					<span class="method">${escape_html(method_path)}</span>
				`
			}
			else
			{
				const line_parts_fallback = line.match(/^(.*) \((.*)\)$/)

				if (line_parts_fallback)
				{
					const method_path = line_parts_fallback[1]
					const file_path   = line_parts_fallback[2]

					if (file_path === 'native')
					{
						line = 
						`
							<span class="method">${escape_html(method_path)}</span>
						`
					}
					else
					{
						line = 
						`
							<span class="file-path">${escape_html(path.basename(file_path))}</span>
							<span class="method">${escape_html(method_path)}</span>
						`
					}
				}
			}

			group.lines.push(line)
		}
	}

	const groups_markup = groups.map(group =>
	{
		const markup =
		`
			<h1>${escape_html(group.title)}</h1>
			<ul>${group.lines.map(line => '<li>' + line + '</li>').join('')}</ul>
		`

		return markup
	})
	.join('')

	const html =
	`
		<html>
			<head>
				<title>${this.message}</title>

				<style>
					body
					{
						margin-top    : 1.6em;
						margin-bottom : 1.6em;

						margin-left   : 2.3em;
						margin-right  : 2.3em;

						font-family : Monospace, Arial;
						font-size   : 20pt;
					}

					ul li 
					{
						margin-bottom   : 1em;
						list-style-type : none;
					}

					.file-path
					{
						font-weight: bold;
					}

					.line-number
					{

					}

					.colon
					{
						color: #9f9f9f;
					}

					.method
					{
						color: #0091C2;
						font-weight: bold;
					}
				</style>
			</head>

			<body>
				${groups_markup}
			</body>
		</html>
	`

	return html
}