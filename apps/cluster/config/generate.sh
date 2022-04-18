#!/bin/bash
if [ ! -d "$DIR" ]; then
mkdir -p ./config
fi

echo -e "/key/swarm/psk/1.0.0/\n/base16/\n$(tr -dc 'a-f0-9' < /dev/urandom | head -c64)" > ./config/swarm.key
export CLUSTER_SECRET=$(od -vN 32 -An -tx1 /dev/urandom | tr -d ' \n')
echo -n -e "$CLUSTER_SECRET"
