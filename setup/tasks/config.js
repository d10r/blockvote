exports.run = (ctx) => {
    //  var retHex = ctx.contract.instance.testFunc.call();
    //  console.log(ctx.web3.toDecimal(retHex))

    // do something useful...
    if(ctx.test) {
        var ret = ctx.contract.instance.testFunc.call()
        console.log('testFunc: ' + ret)

        var ret = ctx.contract.instance.multiply.call(3)
        console.log('multiply: ' + ret)
    }

    if(ctx.candidateName) {
        var ret = ctx.contract.instance.addCandidate.call(ctx.candidateName, 'nix')
        console.log('added: ' + ret)
    }

    var ret = ctx.contract.instance.candidates.call(0)
    console.log(ret)

    // set candidates
}