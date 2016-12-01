// this way to do this seems not to work with import statementes.
// TODO: figure out why

var fs = require('fs')

exports.run = (ctx) => {
    console.log('reading contract source...')
    const contractSrc = fs.readFileSync(ctx.sourceFile)

    compilerOutput = ctx.web3.eth.compile.solidity(contractSrc.toString())
    var jsonString = JSON.stringify(compilerOutput, null, '    ')
    fs.writeFileSync(ctx.compiledFile, jsonString)

    exports.compiledContract = compilerOutput

    ctx.compilerOutput = compilerOutput

    // y, this is a very bad hack!
    updateWebJsFile(jsonString)
}

function updateWebJsFile(jsonString) {

    var outStr = `
// !!! this is autogenerated by a setup script. Changes will be overwritten !!! 
export class Contracts {
    address = '<contractaddress-placeholder>'
    Election = ${jsonString}
}
`

    fs.writeFileSync('../app/src/contracts.js', outStr)
}