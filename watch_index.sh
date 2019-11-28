#!/usr/bin/env bash

file=${1:-"./index.ts"}
echo $file | entr ts-node $file --campaign_id 486415 --data_dir noclip_data --patreon_url https://www.patreon.com/noclip/
