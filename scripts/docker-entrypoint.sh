#!/bin/sh
# Startet im Container als root, richtet den Daten-Ordner ein und gibt die
# Rechte dann an den normalen Nutzer "node" ab. So funktioniert der Ordner
# ./data auf Mac und Pi, ohne dass man Dateirechte von Hand setzen muss.
set -e
mkdir -p "$DATA_DIR/images"
if [ "$(stat -c %U "$DATA_DIR")" != "node" ]; then
  chown -R node:node "$DATA_DIR"
fi
exec setpriv --reuid=node --regid=node --init-groups "$@"
