var fs = require('fs')

exports.run = (ctx) => {
    console.log('reading contract source...')
    const contractSrc = fs.readFileSync(ctx.sourceFile)

    console.log('compiling...')

    compilerOutput = ctx.web3.eth.compile.solidity(contractSrc.toString())
    fs.writeFileSync(ctx.compiledFile, JSON.stringify(compilerOutput, null, '    '))

    exports.compiledContract = compilerOutput

    ctx.compilerOutput = compilerOutput
}