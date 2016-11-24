var process = require('process')
var Web3 = require('web3')
var fs = require('fs')
var keythereum = require("keythereum");

const config = require('./config')

var context = {}
var compileTask = { enabled: false, runner: require('./tasks/compile') }
var createTask = { enabled: false, runner: require('./tasks/create') }
var configTask = { enabled: false, runner: require('./tasks/config') }

parseCmdline()

var web3 = new Web3(new Web3.providers.HttpProvider(config.ethereum.rpc))
web3.eth.defaultAccount = web3.eth.accounts[0]
context = Object.assign(context, { web3: web3, contract: { abi: null, instance: null }, compiledFile: 'tmp/compiled_contract.json', deployedAddressFile: 'tmp/deployed_address' } )

// ################ execute tasks #################

if(compileTask.enabled) {
    console.log('compiling...')
    compileTask.runner.run(context)
}

if(createTask.enabled) {
    console.log('creating...')
    loadCompiledFile()
    // is there really no better way to synchronize this?
    createTask.runner.run(context).then( () => {
        checkExecConfig()
    })
} else {
    checkExecConfig()
}

function checkExecConfig() {
    if (configTask.enabled) {
        console.log('configuring...')
        if (!context.contract.abi) {
            loadCompiledFile()
        }
        loadContract()
        configTask.runner.run(context)
    }
}

// ################ helpers #################

function usageExit() {
    console.log(`\tusage: ${process.argv[1]} [--compile <solidity contract source file>] [--create <election name>] [--config <command>] `)
    console.log('\t\t <solidity contract source file> is expected to have the suffix ".sol"')
    console.log('\t\t config commands:')
    console.log('\t\t\t addCandidate <name>:')
    console.log('\t\t\t startElection:')
    console.log('\t\t\t stopElection:')
    process.exit(1)
}

function parseCmdline() {
    if(process.argv.length <= 2 || process.argv.indexOf('--help') != -1) {
        usageExit()
    }

    if(process.argv.indexOf('--compile') != -1) {
        var solFileIndex = process.argv.indexOf('--compile') + 1
        if(! process.argv[solFileIndex] || ! process.argv[solFileIndex].endsWith('.sol')) {
            usageExit()
        } else {
            compileTask.enabled = true
            context.sourceFile =  process.argv[solFileIndex]
        }
    }

    if(process.argv.indexOf('--create') != -1) {
        var electionNameIndex = process.argv.indexOf('--create') + 1
         if(! process.argv[electionNameIndex]) {
            usageExit()
        } else {
            createTask.enabled = true
            context.electionName =  process.argv[electionNameIndex]
        }
    }

    if(process.argv.indexOf('--config') != -1) {
        var configCmdIndex = process.argv.indexOf('--config') + 1
        if(! process.argv[configCmdIndex]) {
            usageExit()
        } else {
            configTask.enabled = true
            var configCmd = process.argv[configCmdIndex]
            if(configCmd == 'addCandidate') {
                if(! process.argv[configCmdIndex+1]) {
                    usageExit()
                } else {
                    context.candidateName = process.argv[configCmdIndex+1]
                }
            } else if(configCmd == 'startElection') {
                context.startElection = true
            } else if(configCmd == 'stopElection') {
                context.stopElection = true
            } else if(configCmd == 'test') {
                context.test = true
            } else {
                usageExit()
            }
        }
    }
}

function loadCompiledFile() {
    var fileContents = fs.readFileSync(context.compiledFile)
    context.compilerOutput = JSON.parse(fileContents.toString())

    // file format seems to have changed recently
    if(Object.keys(context.compilerOutput)[0] != 'code') {
        contractName = Object.keys(context.compilerOutput)[0]
        context.contract.code = context.compilerOutput[contractName].code
        context.contract.abi = context.compilerOutput[contractName].info.abiDefinition
    } else {
        context.contract.code = context.compilerOutput.code
        context.contract.abi = context.compilerOutput.info.abiDefinition
    }
}

// creates the contract object from the abi
function loadContract() {
    context.contract.object = web3.eth.contract(context.contract.abi)
    var fileContents = fs.readFileSync(context.deployedAddressFile)
    var address = fileContents.toString()
    console.log('addr: |' + address + '|, type: ' + typeof address + ', len: ' + address.length)
    context.contract.instance = context.contract.object.at(address)
    console.log('contract loaded')
}

// for repl
// .load repl_init.js
// node -e "`cat ./repl_init.js`" -i
/*
fs = require('fs')
Web3 = require('web3')

web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:2016'))

file = fs.readFileSync('tmp/compiled_contract.json')
compiled = JSON.parse(file)
abi = compiled.Election.info.abiDefinition
object = web3.eth.contract(abi)
address = fs.readFileSync('tmp/deployed_address').toString()
instance = object.at(address)
instance.testFunc.call()

events = instance.allEvents()
events.watch( (err, event) => { if(! err) console.log(event) } )
 */