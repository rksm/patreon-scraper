#!/usr/bin/env bash

set -euo pipefail
IFS=$'\n\t'

ts-node ./src/fetch_data.ts --campaign_id 486415 --data_dir noclip_data --patreon_url https://www.patreon.com/noclip/
ts-node ./src/render_data.ts  --campaign_id 486415 --data_dir noclip_data --patreon_url https://www.patreon.com/noclip/
