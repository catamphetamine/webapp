var autoprefixer = require('autoprefixer')
var css_custom_properties = require('postcss-custom-properties')
var postcss_calc = require('postcss-calc')
// Is currently only used in `./frontend/code/components/upload picture.scss`: `rgba(#4e3d27, 0.5)`
var postcss_hexrgba = require('postcss-hexrgba')

module.exports =
{
	plugins:
	[
		autoprefixer(),
		css_custom_properties(),
		postcss_calc(),
		postcss_hexrgba
	]
}