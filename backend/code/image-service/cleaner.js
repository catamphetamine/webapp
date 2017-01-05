// https://github.com/59naga/babel-plugin-transform-bluebird/pull/2
import Promise from 'bluebird'

import path from 'path'
import fs from 'fs-extra'
import moment from 'moment'
import bytes from 'bytes'

import { fs_size } from './utility'

Promise.promisifyAll(fs)

const fs_size_async = Promise.promisify(fs_size)

let most_recent_run_date

const temporary_image_expiration_interval = parse_interval(configuration.image_service.temporary_image_expiration_interval)
const clean_up_interval                   = parse_interval(configuration.image_service.clean_up_interval)

const dummy_date = new Date()
const before = moment(dummy_date).subtract(configuration.image_service.clean_up_interval)
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

export function clean_up(options = {})
{
	const { force } = options

	log.debug(`Clean up started`)

	most_recent_run_date = new Date()

	const file_expiration_date = get_file_expiration_date(most_recent_run_date)

	const folder = path.resolve(Root_folder, configuration.image_service.temporary_files_directory)

	return fs.ensureDirAsync(folder).then(() =>
	{
		return fs_size_async(folder)
	})
	.bind({}).then(function(size)
	{
		this.folder_size_before_clean_up = size

		return fs.readdirAsync(folder).map(file_name =>
		{
			return fs.statAsync(path.join(folder, file_name)).then(stats =>
			{
				return { file_name: file_name, is_file: stats.isFile(), size: stats.size, created: stats.birthtime }
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
		return force || moment(file.created).isBefore(file_expiration_date)
	})
	.each(function(file)
	{
		if (!this.files)
		{
			this.files = []
		}

		this.files.push
		({
			name    : file.file_name,
			size    : file.size,
			created : file.created
		})
	})
	.map(file =>
	{
		log.debug(`Deleting expired file ${file.file_name}`)
		return fs.unlinkAsync(path.join(folder, file.file_name))
	})
	.then(() => fs_size_async(folder))
	.then(function(size)
	{
		this.folder_size_after_clean_up = size
	})
	.then(function()
	{
		if (this.folder_size_after_clean_up < this.folder_size_before_clean_up)
		{
			log.info(`Clean up finished. Size before ${bytes(this.folder_size_after_clean_up)}. Size after ${bytes(this.folder_size_after_clean_up)}. Space freed ${bytes(this.folder_size_before_clean_up - this.folder_size_after_clean_up)}`)
		}

		const report =
		{
			size_before : this.folder_size_before_clean_up,
			size_after  : this.folder_size_after_clean_up,
			files       : this.files
		}

		return report
	})
}

export default function run_cleaner()
{
	clean_up.periodical(clean_up_interval_in_milliseconds)
}