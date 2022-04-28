#!/usr/bin/env bash

set -euo pipefail
IFS=$'\n\t'

npx ts-node ./src/fetch_data.ts --campaign_id 1682532 --data_dir darknetdiaries_data --patreon_url https://www.patreon.com/darknetdiaries/ --with-comments
npx ts-node ./src/render_data.ts  --campaign_id 1682532 --data_dir darknetdiaries_data --patreon_url https://www.patreon.com/darknetdiaries/
