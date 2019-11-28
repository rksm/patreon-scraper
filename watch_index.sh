#!/usr/bin/env bash

file=${1:-"./index.ts"}
echo $file | entr ts-node $file
