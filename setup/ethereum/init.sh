set -u
set -e

datadir=$(./get_datadir.sh)
mkdir -p $datadir
geth --datadir $datadir init genesis.json
cp keystore/* $datadir/keystore/
