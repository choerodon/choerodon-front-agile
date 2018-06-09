#!/bin/bash
set -e

find /usr/share/nginx/html -name '*.js' | xargs sed -i "s/SERVICES_URL_EXAMPLE/$PRO_AGILE_HOST/g"

exec "$@"
