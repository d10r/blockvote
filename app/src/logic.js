import {inject} from 'aurelia-framework'
import {Configure} from 'aurelia-configuration'

import Web3 from 'web3'
import Wallet from 'ethereumjs-wallet'
import Tx from 'ethereumjs-tx'

// can't figure out how to model this module to get it usable without injection
import {Contracts} from 'contracts'

// TODO: test browser compatibility (e.g. crypto api)

@inject(Configure, Contracts)
export class Logic {
    constructor(config, contracts) {
        this.config = config
        this.contracts = contracts

        // this is a workaround to get() currently supporting only 2 levels, see https://github.com/Vheissu/aurelia-configuration/issues/68
        var rpcAddr = config.getAll().ethereum.rpc
        this.ethConnect(rpcAddr)

        window.logic = this
        window.wallet = Wallet
        window.tx = Tx
    }

    ethConnect(rpcAddr) {
        this.web3 = new Web3(new Web3.providers.HttpProvider(rpcAddr), (err, result) => {
            if(err) console.log(err)

            console.log('coinbase: ' + this.web3.eth.coinbase)
            this.gasPrice = this.web3.toDecimal(this.web3.eth.gasPrice)
            window.web3 = this.web3 // DEBUG
        })
    }

    contract = {
        instance: null,
        getInstance: () => {
            if(! this.instance) {
                let Contract = this.web3.eth.contract(this.contracts.Election.info.abiDefinition)
                this.instance = Contract.at(this.contracts.address)
                console.log('instance addr: ' + this.contracts.address)
            }
            return this.instance
        }
    }

    watchErrors() {
        this.errEvent = this.contract.getInstance().error()
        this.errEvent.watch( (err, result) => {
            console.log('#err# err: ' + err + ' - result: ' + result)
        })
    }

    watchLog() {
        this.logEvent = this.contract.getInstance().error()
        this.logEvent.watch( (err, result) => {
            console.log('#log# err: ' + err + ' - result: ' + result)
        })
    }

    getRandomToken() {
        var array = new Uint32Array(8)
        window.crypto.getRandomValues(array)
        var token = array.join('')
        return token
        // TODO: convert to an alphanumeric string
    }

    createWallet() {
        this.wallet = Wallet.generate()
        return this.wallet.getAddressString()
    }

    setAddress(address) {
        this.web3.eth.defaultAccount = address
    }

    castVote(candidateId) {
        let instance = this.contract.getInstance()

        this.watchErrors()
        this.watchLog()

        //instance.vote(this.getRandomToken(), 'dummy', candidateId) // that would be too easy :-)
        // we need to manually handle the transaction creation and signing process
        let callData = instance.vote.getData(this.getRandomToken(), 'dummy', candidateId)
        let pk = this.wallet.getPrivateKey()
        let rawTx = {
            nonce: '0x00', // our first transaction
            gasPrice: this.web3.toHex(this.gasPrice),
            gasLimit: this.web3.toHex(1000000),
            to: this.contracts.address,
            value: '0x00',
            data: callData
        }
        let tx = new Tx(rawTx)
        tx.sign(pk)
        let serializedTx = tx.serialize()
        this.sentTx = this.web3.eth.sendRawTransaction(serializedTx.toString('hex'), (err, hash) => {
            if(err) {
                console.log(err)
            } else {
                console.log('castVote done in Tx ' + hash)
            }
        })
    }

    watchVotes(callback) {
        this.voteEvent = this.contract.getInstance().voteEvent()
        this.voteEvent.watch( (err, result) => {
            if(err) {
                console.log('### voteEvent: ' + err)
            }
            if(result) {
                let resultStr = JSON.stringify(result)
                console.log('*** voteEvent: ' + resultStr)
                callback(result)
            }
        })
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

        // 100000000000000000
        // 10001000000000000
    }

    accountIsFunded() {
        let balance = this.web3.toDecimal(this.web3.eth.getBalance(this.web3.eth.defaultAccount))
        if(balance > 0)
            return true
        else
            return false
    }
}
