import sharp from 'sharp'

// returns:
//
// {
// 	width,       // 1000
// 	height,      // 1000
// 	format,      // 'jpeg', 'png', ...
// 	'mime type', // 'image/jpeg'
// 	...
// }
//
export default function identify(path)
{
	return sharp(path).metadata()
}
