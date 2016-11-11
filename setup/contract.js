var Web3 = require('web3')
var fs = require('fs')
var keythereum = require("keythereum");

const config = require('./config')

console.log('reading contract source...')
const contractSrc = fs.readFileSync('contracts/bkcvote.sol')

console.log('compiling...')
var web3 = new Web3(new Web3.providers.HttpProvider(config.ethereum.rpc))
compilerOutput = web3.eth.compile.solidity(contractSrc.toString())
fs.writeFileSync('tmp/contract.json', JSON.stringify(compilerOutput, null, '    '))

console.log('deploying...')
const electionName = "BP2016"
const blockStart = 1000
const blockEnd = 2000
const adminAcc = web3.eth.accounts[0]

var contract = web3.eth.contract(compilerOutput.BKCVote.info.abiDefinition)


var estGas = web3.eth.estimateGas({data: compilerOutput.BKCVote.code})
console.log('estimated gas needed: ' + estGas)

// var contractInstance = MyContract.new([contructorParam1] [, contructorParam2], {data: '0x12345...', from: myAccount, gas: 1000000});
// constructor params: string _electionName, uint _blockStart, uint _blockEnd
contract.new(electionName, blockStart, blockEnd,
    { data: compilerOutput.BKCVote.code, from: adminAcc, gas: 3000000 }, (err, deployedContract) => {
        // this callback is fired twice according to the doc. After issuing the transaction and after having been mined
        if(err) {
            console.log(err)
        } else {
            if(! deployedContract.address) {
                console.log("TxHash: " + deployedContract.transactionHash)
                console.log("waiting for it to be mined (make sure somebody is mining!)...")
            }
            else {
                console.log("address: " + deployedContract.address)

                console.log('all done, all happy!')
            }
        }
} )
