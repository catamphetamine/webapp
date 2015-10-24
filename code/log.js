import bunyan        from 'bunyan'
import stream        from 'stream'
import util          from 'util'
import moment        from 'moment'
import Error_printer from 'pretty-error'

const console_output = new stream()
console_output.writable = true

// import colors from 'colors/safe'
//
// console.log(colors.green('hello')) // outputs green text
// console.log(colors.red.underline('i like cake and pies')) // outputs red underlined text
// console.log(colors.inverse('inverse the color')) // inverses the color
// console.log(colors.rainbow('OMG Rainbows!')) // rainbow
// console.log(colors.trap('Run the trap')) // Drops the bass

const error_printer = new Error_printer()

function print_error(error)
{
	console.log(error_printer.render(error))
}

const colours =
{
	Trace : 'blue',
	Debug : 'cyan',
	Info  : 'green',
	Warn  : 'yellow',
	Error : 'red',
	Fatal : 'magenta',
	'...' : 'grey'
}

const styles = 
{
	//styles
	'bold'      : [1,  22],
	'italic'    : [3,  23],
	'underline' : [4,  24],
	'inverse'   : [7,  27],

	//grayscale
	'white'     : [37, 39],
	'grey'      : [90, 39],
	'black'     : [90, 39],

	//colors
	'blue'      : [34, 39],
	'cyan'      : [36, 39],
	'green'     : [32, 39],
	'magenta'   : [35, 39],
	'red'       : [31, 39],
	'yellow'    : [33, 39]
}

function colorize_start(style)
{
	return style ? '\x1B[' + styles[style][0] + 'm' : ''
}

function colorize_end(style)
{
	return style ? '\x1B[' + styles[style][1] + 'm' : ''
}

function colorize(text, style)
{
	return colorize_start(style) + text + colorize_end(style)
}

// if ((item instanceof Error) && item.stack)
// {
// 	item = 
// 	{
// 		inspect: function()
// 		{
// 			return print_error(item)
// 			// return util.format(item) + '\n' + item.stack
// 		}
// 	}
// }

function preamble(source, level, time, colour)
{
	let preamble = `[${source}] ${time} `
	if (level !== 'Generic')
	{
		preamble += `${level} `
	}
	return colorize(preamble, colour)
}

function print(source, level, message, time)
{
	time = moment(time).format("dddd, MMMM Do YYYY, hh:mm:ss")

	return console.log(preamble
	(
		source,
		level,
		time,
		colours[level.toString()] || colours['...']
	)
	+ message)
}

// for the function below
const _print = print

console_output.write = data =>
{
	if (data.err)
	{
		return print_error(data.err)
	}

	const print = (level, message, time) => _print(data.name, level, message, time)

	switch (data.level)
	{
		case 60:
			print('Fatal', data.msg, data.time)
			break

		case 50:
			print('Error', data.msg, data.time)
			break

		case 40:
			print('Warning', data.msg, data.time)
			break

		case 30:
			print('Generic', data.msg, data.time)
			break

		case 20:
			print('Debug', data.msg, data.time)
			break

		case 10:
			print('Trace', data.msg, data.time)
			break

		default:
			print('...', data.msg, data.time)
			break
	}
}

const development_log = 
{
	streams: 
	[{
		type: 'raw',
		stream: console_output
	}],
	serializers: 
	{
		error    : bunyan.stdSerializers.err,
		request  : bunyan.stdSerializers.req,
		response : bunyan.stdSerializers.res,
	}
}

const production_log = {}

const log_configuration = process.env.NODE_ENV === 'production' ? production_log : development_log

export default function create(name)
{
	return bunyan.createLogger(Object.extend({ name: name }, log_configuration))
}