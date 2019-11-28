#!/usr/bin/env bash

set -euo pipefail
IFS=$'\n\t'

ts-node ./fetch_data.ts --campaign_id 1682532 --data_dir darknetdiaries_data --patreon_url https://www.patreon.com/darknetdiaries/
ts-node ./render_data.ts  --campaign_id 1682532 --data_dir darknetdiaries_data --patreon_url https://www.patreon.com/darknetdiaries/
