fs = require('fs')
Web3 = require('web3')
config = require('./config')

function update() {

	
	web3 = new Web3(new Web3.providers.HttpProvider(config.ethereum.rpc))

	file = fs.readFileSync('tmp/compiled_contract.json')
	compiled = JSON.parse(file)
	try {
		abi = compiled.Election.info.abiDefinition
	} catch(e) {
		abi = compiled.info.abiDefinition
	}
	object = web3.eth.contract(abi)
	address = fs.readFileSync('tmp/deployed_address').toString()

	web3.eth.defaultAccount = web3.eth.accounts[0]

	instance = object.at(address)
	instance.testFunc.call()

	events = instance.allEvents()
	events.watch( (err, event) => {
 	        if(err) console.log('###' + err)
		if(event) console.log('*** ' + JSON.stringify(event, null, '  '))
	} )
}

update()
