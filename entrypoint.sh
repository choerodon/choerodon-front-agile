#bin/bash
set -e

PRO_API_HOST=${PRO_API_HOST:-"gateway.choerodon.com.cn"}
PRO_CLIENT_ID=${PRO_CLIENT_ID:-"agile"}

find /usr/share/nginx/html -name '*.js' | xargs sed -i "s/localhost:8080/$PRO_API_HOST/g"
find /usr/share/nginx/html -name '*.js' | xargs sed -i "s/localhost:clientId/$PRO_CLIENT_ID/g"

nginx -g 'daemon off;'

exec "$@"
