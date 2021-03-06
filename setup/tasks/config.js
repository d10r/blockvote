var exec = require('child_process').exec
var fs = require('fs')

var privKeyFile = 'keys/private.pem'
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
        var ret = ctx.contract.instance.addCandidate(ctx.candidateName)
        console.log('added: ' + ctx.candidateName + ' - ' + ret)
    }

    if(ctx.startElection) {
        var ret = ctx.contract.instance.startElection()
        console.log('election started' + ' - ' + ret)
    }

    if(ctx.stopElection) {
        var ret = ctx.contract.instance.stopElection()
        console.log('election stopped' + ' - ' + ret)
    }

    if(ctx.processResult) {
        console.log('processing result...')

        ctx.electionResult = {}
        let decryptPromises = []

        // always returns 0 for unknown reason, thus ignored
        let nrVotes = ctx.contract.instance.voters.length
        console.log('nr votes: ' + nrVotes)
        for(var i=0; true; i++) {
            try {
                let v = ctx.contract.instance.voters(i)
                console.log(`fetched vote ${i}`)
                //console.log(i + ': ' + v[2])

                decryptPromises.push(decryptPromise(i, v[2]))
            } catch(e) {
                // workaround because of unknown length: iterate until it fails
                // TODO: distinguish between end of array and other errors
                //console.error(e)
                console.log(`end reached after ${i} iterations`)
                if(i == 0)
                    return
                else
                    break
            }
        }

        console.log('waiting for decryption to finish...')
        Promise.all(decryptPromises).then( () => {
            let resultStr = JSON.stringify(ctx.electionResult)
            console.log('all done. Result: ' + resultStr)

            if(resultStr)
            publishResult(resultStr)
        })
    }

    function publishResult(result) {
        console.log('publishing...')
        let privKey = fs.readFileSync(privKeyFile).toString()
        ctx.contract.instance.publishResult(result, privKey, {gas: 2000000}) // quite expensive
        console.log('done')
    }

    function decryptPromise(id, encVote) {
        return new Promise((resolve, reject) => {
            var encFilename = '.encVote' + id
            var buf = Buffer.from(encVote, 'base64')
            fs.writeFileSync(encFilename, buf)

            let decryptCmd =  `openssl rsautl -decrypt -oaep -inkey ${privKeyFile} -in ${encFilename}`
            exec(decryptCmd, (error, stdout, stderr) => {
                fs.unlink(encFilename)
                if(error) {
                    console.error(`exec error: ${error}`)
                    reject()
                    //return
                }

                let candidateName = stdout
                console.log(`decrypted vote ${id}: ${candidateName}`)

                if(! ctx.electionResult[candidateName])
                    ctx.electionResult[candidateName] = 1
                else
                    ctx.electionResult[candidateName]++

                resolve()
            })
        })
    }
}

