#!/usr/bin/env bash

set -euo pipefail
IFS=$'\n\t'

ts-node ./noclip_fetch_data.ts
ts-node ./noclip_render_data.ts
