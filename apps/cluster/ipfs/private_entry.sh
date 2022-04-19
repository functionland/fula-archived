echo "Patch work"
if [ -e "$repo/FULA" ]; then
  echo "Found Fyka"
else
  echo "remove nodes"
  ipfs bootstrap rm --all
  touch $repo/FULA
fi

