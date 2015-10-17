#!/bin/bash

project_directory="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# https://github.com/Unitech/pm2
# https://github.com/Unitech/PM2/blob/master/ADVANCED_README.md

pm2 startOrRestart "$project_directory/../pm2.json" --name webapp