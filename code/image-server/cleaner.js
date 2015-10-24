import path from 'path'
import fs from 'fs-extra'
import moment from 'moment'
import bytes from 'bytes'

import { fs_size } from './utility'
import log from './log'

const fs_size_async = Promise.promisify(fs_size)

let most_recent_run_date

const temporary_image_expiration_interval = parse_interval(configuration.image_server.temporary_image_expiration_interval)
const clean_up_interval                   = parse_interval(configuration.image_server.clean_up_interval)
// const clean_up_interval = moment(configuration.image_server.clean_up_interval).toDate().getTime() - Date.now()

const dummy_date = new Date()
const before = moment(dummy_date).subtract(configuration.image_server.clean_up_interval)
const clean_up_interval_in_milliseconds = dummy_date.getTime() - before.toDate().getTime()

// parses { days: 1 } into { units: 'days', value: 1 }
function parse_interval(object)
{
	const units = Object.keys(object)[0]
	const value = object[units]

	return { value, units }
}

// if a file was created before this date it's considered expired
function get_file_expiration_date(now)
{
	const file_expiration_date = moment(now)

	return file_expiration_date.subtract(temporary_image_expiration_interval.value, temporary_image_expiration_interval.units)
}

function clean_up()
{
	// log.debug
	log.info(`Clean up started`)

	most_recent_run_date = new Date()

	const file_expiration_date = get_file_expiration_date(most_recent_run_date)

	const folder = path.resolve(Root_folder, configuration.image_server.temporary_files_directory)

	return fs_size_async(folder).bind({}).then(function(size)
	{
		this.folder_size_before_clean_up = size

		return fs.readdirAsync(folder).map(file_name =>
		{
			return fs.statAsync(path.join(folder, file_name)).then(stats =>
			{
				return { file_name: file_name, is_file: stats.isFile(), created: stats.birthtime }
			})
		})
	})
	.filter(file =>
	{
		if (!file.is_file)
		{
			log.error(`File ${path.join(folder, file.file_name)} is supposed to be a file`)
			return false
		}

		// get all expired files
		return moment(file.created).isBefore(file_expiration_date)
	})
	.map(file =>
	{
		// log.debug(`Deleting expired file ${file.file_name}`)
		log.info(`Deleting expired file ${file.file_name}`)

		// return fs.unlinkAsync(path.join(folder, file.file_name))
		return true
	})
	.then(() => fs_size_async(folder))
	.then(function(size)
	{
		this.folder_size_after_clean_up = size
	})
	.then(function()
	{
		// log.debug
		log.info(`Clean up finished. Size before ${bytes(this.folder_size_after_clean_up)}. Size after ${bytes(this.folder_size_after_clean_up)}. Space freed ${bytes(this.folder_size_before_clean_up - this.folder_size_after_clean_up)}`)
	})
}

clean_up.periodical(clean_up_interval_in_milliseconds)