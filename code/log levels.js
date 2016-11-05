const log_levels =
{
	10 : 'Trace',
	20 : 'Debug',
	30 : 'Generic',
	40 : 'Warning',
	50 : 'Error',
	60 : 'Fatal'
}

export default log_levels

export const log_level_values = {}

for (let key of Object.keys(log_levels))
{
	log_level_values[log_levels[key]] = key
}