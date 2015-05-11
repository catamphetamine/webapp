path = require 'path'

include = (include_path) -> require(path.resolve(path.join(__dirname, '..'), include_path))
global.include = include