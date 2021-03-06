var fs = require('fs')

exports.run = (ctx) => {
    return new Promise( (resolve) => {
        var estGas = ctx.web3.eth.estimateGas({data: ctx.contract.code})
        console.log('estimated gas needed: ' + estGas)

        const adminAcc = ctx.web3.eth.accounts[0]

        ctx.contract.object = ctx.web3.eth.contract(ctx.contract.abi)

        // var contractInstance = MyContract.new([contructorParam1] [, contructorParam2], {data: '0x12345...', from: myAccount, gas: 1000000});
        // constructor params: string _electionName, uint _blockStart, uint _blockEnd

        ctx.contract.object.new(ctx.electionName,
            {data: ctx.contract.code, from: adminAcc, gas: 3000000}, (err, contractInstance) => {
                // this callback is fired twice according to the doc. After issuing the transaction and after having been mined
                if (err) {
                    console.log(err)
                    throw err
                } else {
                    ctx.contract.instance = contractInstance
                    if (!contractInstance.address) {
                        console.log("TxHash: " + contractInstance.transactionHash)
                        console.log("waiting for it to be mined (make sure somebody is mining!)...")
                    }
                    else {
                        console.log("address: " + contractInstance.address)
                        fs.writeFileSync(ctx.deployedAddressFile, contractInstance.address)
                        updateWebJsFile(contractInstance.address) // uuhhh oohhh
                        console.log('all done, all happy!')
                        resolve()
                    }
                }
            })

    })
}

function updateWebJsFile(address) {
    console.log('updating ../app/src/contracts.js')
    var oldData = fs.readFileSync('../app/src/contracts.js')
    // updates only the first match which is expected quite at the top of the file
    var newData = oldData.toString().replace(/\saddress\s*=\s*.*/, `address = "${address}"`)
    fs.writeFileSync('../app/src/contracts.js', newData)
}