#!/bin/sh
# Ensure the data directory is writable by the app user (uid 1001)
# when a Docker volume is mounted at /app/data as root.
if [ "$(id -u)" = "0" ]; then
  chown app:app /app/data
  exec su -s /bin/sh app -- node server.js
else
  exec node server.js
fi
