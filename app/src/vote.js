import {inject} from 'aurelia-framework'
import {ApplicationState} from 'applicationstate'
import {Logic} from 'logic'
import * as cryptoHelper from 'crypto'

@inject(ApplicationState, Logic)
export class Vote {

    constructor(appState, logic) {
        this.appState = appState
        this.logic = logic

        if (this.appState.token === null) {
            console.log('token not set, need auth')
            window.location = "#/authenticate";
        } else {
            console.log('token: ' + this.appState.token)
        }
    }

    cast_vote() {
        cryptoHelper.test_import_key()
        // TODO: encrypt vote


    }
}
