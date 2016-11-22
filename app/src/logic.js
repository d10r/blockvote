import {inject} from 'aurelia-framework'
import {Configure} from 'aurelia-configuration'

import Web3 from 'web3'
import Wallet from 'ethereumjs-wallet'

// can't figure out how to model this module to get it usable without injection
import {Contracts} from 'contracts'

@inject(Configure, Contracts)
export class Logic {
    constructor(config, contracts) {
        this.config = config
        this.contracts = contracts
        // TODO: test browser compatibility (especially crypto api)

        // TODO: how to get this working?
        // this.contract = config.get('ethereum.contract.address')
        //this.contract.address = "0xefb28f664b5d87c4efe0700d59a1793f2c0f4c0e" // hardcoding in the meantime
        //this.contract = Contracts.bkcvote

        // this is a workaround to get() currently supporting only 2 levels, see https://github.com/Vheissu/aurelia-configuration/issues/68
        var rpcAddr = config.getAll().ethereum.rpc
        this.web3 = new Web3(new Web3.providers.HttpProvider(rpcAddr))
        console.log(this.web3)

        //web3.eth.defaultAccount = this.web3.eth.accounts[0] // TODO: for dev only

        console.log('coinbase: ' + this.web3.eth.coinbase)
    }

    getRandomToken() {
        var array = new Uint32Array(8)
        window.crypto.getRandomValues(array)
        var token = array.join('')
        return token
        // TODO: convert to an alphanumberic string
    }

    createNewAddress() {
        //var wallet = new Wallet()
        var newAddr = Wallet.generate()
        return newAddr.getAddressString()
    }

    setAddress(address) {
        this.web3.eth.defaultAccount = address
    }

    testContract() {
        var Contract = this.web3.eth.contract(this.contracts.Election.info.abiDefinition)
        this.contractInstance = Contract.at(this.contracts.address)
        console.log('instance addr: ' + this.contracts.address)

        console.log('multiply(): ' + this.contractInstance.multiply.call(2, 3)) // call executes locally, without tx
    }

    // requests some funding for the given address, needed in order to be able to send transactions
    // It may take a while (~20 seconds) for the funds to become available. That delay needs to be handled in UI
    // TODO: persist txhash somewhere, e.g. in appstate?
    // TODO: check if we can switch to fetch api
    refuelTxHash = null
    fundAccount(address) {
        $.ajax(this.config.getAll().refuelBaseUrl + address)
            .done((data, textStatus, jqXHR) => {
                console.log('refuel done: ' + data)
                this.refuelTxHash = data.txHash
                console.log(this.refuelTxHash)
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                console.log('refuel fail: ' + textStatus + ' - ' + errorThrown)
            })
    }
}
