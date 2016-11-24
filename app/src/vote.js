import {inject} from 'aurelia-framework'
import {ApplicationState} from 'applicationstate'
import {Logic} from 'logic'
import * as cryptoHelper from 'crypto'

@inject(ApplicationState, Logic)
export class Vote {

    constructor(appState, logic) {
        this.appState = appState
        this.logic = logic
        this.web3 = logic.web3

        if (this.appState.token === null) {
            console.log('token not set, need auth')
            window.location = "#/authenticate";
        } else {
            console.log('token: ' + this.appState.token)
        }

        this.installFundsWaitingPromise()
        window.vote = this
    }

    // TODO: visualize the state
    installFundsWaitingPromise() {
        this.accountFundedPromise = new Promise((resolve, reject) => {
            function checkAndWait(logic) {
                if (!logic.accountIsFunded()) {
                    console.log('funds pending...')
                    setTimeout(checkAndWait, 2000)
                } else {
                    console.log('funds have arrived')
                    resolve()
                }
            }

            checkAndWait(this.logic)
        })
    }

    setVote(candidate) {
        this.vote = candidate
        this.candidateId = parseInt(candidate)
        cryptoHelper.test_import_key()
    }

    castVote() {
        this.accountFundedPromise.then( () => {
            this.logic.castVote(this.candidateId)
            this.appState.persist()

            window.location = "#/process";
        })
    }
}
