#!/usr/bin/env bash

set -euo pipefail
IFS=$'\n\t'

ts-node ./fetch_data.ts --campaign_id 486415 --data_dir noclip_data --patreon_url https://www.patreon.com/noclip/
ts-node ./render_data.ts  --campaign_id 486415 --data_dir noclip_data --patreon_url https://www.patreon.com/noclip/
