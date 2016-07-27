// These are the assets used in "code/page-server/html.js" file
// which is a React component used to render React on the server side.
//
// This file needs to be require()d from anywhere in your client code
// in order for these assets to be detected and parsed by Webpack.
//
// Otherwise these assets won't be a part of Webpack build 
// since "code/page server/html.js" is not require()d anywhere in client code
// because it's only needed for server side rendering.
//
// (you'll also need to add the corresponding asset types to isomorphic.js;
//  otherwise you'll get syntax errors when requiring these files on server)
//
// (this module returns functions to overcome require() caching in development mode)
//
export default
{
	icon: () => require('../assets/images/icon/cat_64x64.png'), // icon/32x32.png

	// there will be no .scss on server in production
	style: () => require('../assets/styles/style.scss')
}