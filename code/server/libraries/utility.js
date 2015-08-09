import fs from 'fs'

export const load = json => JSON.parse(fs.readFileSync(json, 'utf8'))
global.load = load