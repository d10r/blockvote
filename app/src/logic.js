var contract = require('contract')
var web3 = require('web3')

export class Logic {



    constructor() {
        // TODO: test browser compatibility

        // TODO: how to get this working?
        // this.contract = config.get('ethereum.contract.address')
        this.contract.address = "0xefb28f664b5d87c4efe0700d59a1793f2c0f4c0e" // hardcoding in the meantime
        // this.contract.

    }

    getRandomToken() {
        var array = new Uint32Array(8)
        window.crypto.getRandomValues(array)
        var token = array.join('')
        return token
        // TODO: convert to an alphanumberic string
    }
}