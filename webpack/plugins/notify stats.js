// outputs webpack stats to console if there are no errors or warnings

function error(error)
{
	// BELLs when something goes wrong!
	console.log("\x07" + error)
}

function warning(warning)
{
	console.log(warning)
}

module.exports = function notifyStats(stats)
{
	var json = stats.toJson()

	if (json.errors.not_empty())
	{
		json.errors.forEach(error)
	}
	else if (json.warnings.not_empty())
	{
		json.warnings.forEach(warning)
	} 
	else
	{
		console.log(stats.toString
		({
			chunks: false,
			colors: true
		}))
	}
}