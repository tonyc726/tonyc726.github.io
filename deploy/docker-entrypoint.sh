#!/bin/sh
set -eu

port="${PORT:-80}"
case "$port" in
  ''|*[!0-9]*)
    echo "invalid PORT: ${port}" >&2
    exit 1
    ;;
esac

sed "s/__PORT__/${port}/g" /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
