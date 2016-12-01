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

        //this.installFundsWaitingPromise()
        window.vote = this
    }

    setVote(candidate) {
        this.vote = candidate
        this.candidateId = parseInt(candidate)
        cryptoHelper.test_import_key()
    }

    castVote() {
        // if no candidate is selected, let voter confirm if that's intentional
        if(this.candidateId == undefined) {
            $('#whiteVoteModal').modal()
        } else {
            this.castVoteConfirmed()
        }

    }

    castVoteConfirmed() {
        // TODO: visualize state if waiting for promise
        this.logic.accountFundedPromise.then( () => {
            this.logic.castVote(this.candidateId)
            this.appState.persist()

            window.location = "#/process";
        })
    }
}
