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

        // eth and account setup are done asap, because the funding request will take some time anyway
        // and may block voting (the voting module waits for a funding promise)
        this.initEth()
        this.createAndFundAccount()
        this.instantiateContract()

        this.watchElectionStatus()

        window.web3 = this.web3 // DEBUG
        window.logic = this
        //window.Wallet = Wallet
        window.tx = Tx
    }

    initEth() {
        // getAll() is a workaround to get() currently supporting only 2 levels, see https://github.com/Vheissu/aurelia-configuration/issues/68
        let rpcAddr = this.config.getAll().ethereum.rpc

        console.log('creating web3')
        this.web3 = new Web3(new Web3.providers.HttpProvider(rpcAddr))

        this.gasPrice = 20000000000 // init to a reasonable value
        this.web3.eth.getGasPrice( (err, ret) => {
            if(! err) {
                this.gasPrice = this.web3.toDecimal(ret)
                console.log('gasPrice: ' + this.gasPrice)
            }
        })

        this.wallet = Wallet.generate()
    }

    createAndFundAccount() {
        //debugger
        let addr = this.wallet.getAddressString()
        console.log('new addr: ' + addr)
        this.web3.eth.defaultAccount = addr

        this.fundAccount(addr);
        var that = this

        this.accountFundedPromise = new Promise((resolve, reject) => {
            const pollIntervalMs = 2000
            var waitingSinceMs = 0
            function checkAndWait() {
                that.web3.eth.getBalance(that.web3.eth.defaultAccount, (err, ret) => {
                    let funded = false
                    if(! err) {
                        let balance = that.web3.toDecimal(ret)
                        if (balance > 0)
                            funded = true
                    }
                    if(! funded) {
                        console.log('funds pending...')
                        setTimeout(checkAndWait, pollIntervalMs)
                        waitingSinceMs += pollIntervalMs
                    } else {
                        console.log('funds have arrived after ' + waitingSinceMs / 1000 + ' s')
                        resolve()
                    }
                })
            }

            checkAndWait()
        })
    }

    instantiateContract() {
        let Contract = this.web3.eth.contract(this.contracts.Election.info.abiDefinition)

        this.Election = Contract.at(this.contracts.address)
        console.log('instance addr: ' + this.contracts.address)
    }

    accountIsFunded() {
        let balance = this.web3.toDecimal(this.web3.eth.getBalance(this.web3.eth.defaultAccount))
        if(balance > 0)
            return true
        else
            return false
    }

    watchElectionStatus() {
        let update = () => {
            this.Election.currentStage((err, ret) => {
                if (!err) {
                    let newStatus = this.web3.toDecimal(ret)
                    if(this.electionStatus != newStatus) {
                        console.log(`new election status: ${newStatus} (${this.electionStageToString(newStatus)})`)
                        this.electionStatus = newStatus
                    }
                }
                setTimeout(update, 10000)
            })
        }

        update()
    }

    electionStageToString(stage) {
        switch(stage) {
            case 0: return 'not yet started'
            case 1: return 'in progress'
            case 2: return 'over'
        }
    }

    watchErrors() {
        this.errEvent = this.Election.error()
        this.errEvent.watch( (err, result) => {
            console.log('#err# err: ' + JSON.stringify(err) + ' - result: ' + JSON.stringify(result))
        })
    }

    watchLog() {
        this.logEvent = this.Election.error()
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

    castVote(candidateId) {
        this.watchErrors()
        this.watchLog()

        //this.Election.vote(this.getRandomToken(), 'dummy', candidateId) // that would be too easy :-)
        // we need to manually handle the transaction creation and signing process
        let callData = this.Election.vote.getData(this.getRandomToken(), 'dummy', candidateId)
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
        this.voteEvent = this.Election.voteEvent()
        this.voteEvent.watch( (err, result) => {
            if(err) {
                console.log('### voteEvent: ' + JSON.stringify(err))
            }
            if(result) {
                let resultStr = JSON.stringify(result)
                console.log('*** voteEvent: ' + JSON.stringify(resultStr))
                callback(result)
            }
        })
    }

    // requests some funding for the given address, needed in order to be able to send transactions
    // It may take a while (~20 seconds) for the funds to become available. That delay needs to be handled in UI
    // TODO: persist txhash somewhere, e.g. in appstate?
    // TODO: check if we can switch to fetch api
    refuelTxHash = null
    fundAccount(address) {
        $.ajax(this.config.getAll().refuelBaseUrl + address)
            .done((data, textStatus, jqXHR) => {
                console.log('refuel request done: ' + JSON.stringify(data))
                this.refuelTxHash = data.txHash
                console.log(this.refuelTxHash)
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                console.log('refuel request fail: ' + textStatus + ' - ' + errorThrown)
            })

        // 100000000000000000
        // 10001000000000000
    }
}
