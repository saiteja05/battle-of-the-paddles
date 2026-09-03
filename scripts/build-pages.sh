#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

API_BACKUP="$(mktemp -d)"
cleanup() {
  if [[ -d "${API_BACKUP}/api" ]]; then
    rm -rf src/app/api
    cp -r "${API_BACKUP}/api" src/app/api
  fi
  rm -rf "${API_BACKUP}"
}
trap cleanup EXIT

if [[ -d src/app/api ]]; then
  cp -r src/app/api "${API_BACKUP}/"
  rm -rf src/app/api
fi

NEXT_PUBLIC_STATIC_HOSTING=1 \
NEXT_PUBLIC_BASE_PATH= \
NEXT_PUBLIC_OPERATOR_PIN=0909 \
next build
