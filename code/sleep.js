var args = process.argv.slice(2)

var delay = args[0]

if (typeof delay === 'undefined')
{
	return console.error('[sleep] delay (in ms) not specified')
}

if (delay != parseInt(delay))
{
	return console.error('[sleep] invalid delay: "' + delay + '"')
}

console.log('[sleep] sleeping for ' + delay + ' milliseconds')

setTimeout(function()
{
	console.log('[sleep] woken up')
	process.exit(0)
},
delay)