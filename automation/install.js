const path = require('path')
const fs = require('fs')
const child_process = require('child_process')

const root = process.cwd()
npm_install_recursive(root)

function npm_install_recursive(folder)
{
	const has_package_json = fs.existsSync(path.join(folder, 'package.json'))

	if (!has_package_json && path.basename(folder) !== 'code')
	{
		return
	}

	// Since this script is intended to be run as a "preinstall" command,
	// skip the root folder, because it will be `npm install`ed in the end.
	if (has_package_json)
	{
		if (folder === root)
		{
			console.log('===================================================================')
			console.log(`Performing "npm install" inside root folder`)
			console.log('===================================================================')
		}
		else
		{
			console.log('===================================================================')
			console.log(`Performing "npm install" inside ${folder === root ? 'root folder' : './' + path.relative(root, folder)}`)
			console.log('===================================================================')
		}
		
		npm_install(folder)
	}

	for (let subfolder of subfolders(folder))
	{
		npm_install_recursive(subfolder)
	}
}

function npm_install(where)
{
	child_process.execSync('npm install', { cwd: where, env: process.env, stdio: 'inherit' })
}

function subfolders(folder)
{
	return fs.readdirSync(folder)
		.filter(subfolder => fs.statSync(path.join(folder, subfolder)).isDirectory())
		.filter(subfolder => subfolder !== 'node_modules' && subfolder[0] !== '.')
		.map(subfolder => path.join(folder, subfolder))
}