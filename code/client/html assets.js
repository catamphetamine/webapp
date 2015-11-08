// include these assets in webpack build
// (you'll also need to add the corresponding asset types to isomorphic.js;
//  otherwise you'll get syntax errors when requiring these files on server)
export default
{
	icon: () => require('../../assets/images/icon/cat_64x64.png'), // icon/32x32.png

	// there will be no .scss on server in production
	style: () => require('../../assets/styles/style.scss')
}