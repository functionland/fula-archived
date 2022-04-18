#!/bin/bash

if [ ! -d "$DIR" ]; then
mkdir -p ./config
fi

echo -e "/key/swarm/psk/1.0.0/\n/base16/\n$(tr -dc 'a-f0-9' < /dev/urandom | head -c64)" > ./config/swarm.key
export CLUSTER_SECRET=$(tr -dc 'a-f0-9' < /dev/urandom | head -c64)
echo "$CLUSTER_SECRET"
