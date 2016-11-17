var process = require('process')
var Web3 = require('web3')
var fs = require('fs')
var keythereum = require("keythereum");

const config = require('./config')

var context = {}
var compileTask = { enabled: false, runner: require('./tasks/compile') }
var createTask = { enabled: false, runner: require('./tasks/create') }
var initTask = { enabled: false, runner: require('./tasks/init')}

parseCmdline()

var web3 = new Web3(new Web3.providers.HttpProvider(config.ethereum.rpc))
context = Object.assign(context, { web3: web3, contract: { abi: null, instance: null }, compiledFile: 'tmp/compiled_contract.json', deployedAddressFile: 'tmp/deployed_address' } )

// ################ execute tasks #################

if(compileTask.enabled) {
    console.log('compiling...')
    compileTask.runner.run(context)
}

context.contract.abi
if(createTask.enabled) {
    console.log('creating...')
    loadCompiledFile()
    // is there really no better way to synchronize this?
    createTask.runner.run(context).then( () => {
        checkExecInit()
    })
} else {
    checkExecInit()
}

function checkExecInit() {
    if (initTask.enabled) {
        console.log('initializing...')
        if (!context.contract.abi) {
            loadCompiledFile()
        }
        loadContract()
        initTask.runner.run(context)
    }
}

// ################ helpers #################

function usageExit() {
    console.log(`\tusage: ${process.argv[1]} [--compile <solidity contract source file>] [--create] [--init] `)
    console.log('\t\t <solidity contract source file> is expected to have the suffix ".sol"')
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
        createTask.enabled = true
    }

    if(process.argv.indexOf('--init') != -1) {
        initTask.enabled = true
    }
}

function loadCompiledFile() {
    var fileContents = fs.readFileSync(context.compiledFile)
    context.compilerOutput = JSON.parse(fileContents.toString())
    context.contract.name = Object.keys(context.compilerOutput)[0]
    context.contract.raw = context.compilerOutput[context.contract.name]
    context.contract.abi = context.contract.raw.info.abiDefinition

    // context.contract.instance = null
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
