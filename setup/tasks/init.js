exports.run = (ctx) => {
    var retHex = ctx.contract.instance.testFunc.call();
    console.log(ctx.web3.toDecimal(retHex))

    // do something useful...
}