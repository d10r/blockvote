geth --dev --datadir $(./get_datadir.sh) --networkid 2016 --rpc --rpcapi "db,eth,net,web3" --rpcaddr 0.0.0.0 --rpcport 2016 --rpccorsdomain "*" --port 32016 --identity blockvote0 --etherbase ae4a95287aaa216c5361db6810d06f28de956c4d --mine --minerthreads 1 --unlock ae4a95287aaa216c5361db6810d06f28de956c4d --password passwordFile js conditionalmining.js
