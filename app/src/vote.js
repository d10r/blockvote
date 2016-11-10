import {inject} from 'aurelia-framework'
import {ApplicationState} from 'applicationstate'
import {Logic} from 'logic'

@inject(ApplicationState, Logic, Configure)
export class Vote {

    constructor(appState, logic, config) {
        this.appState = appState
        this.logic = logic

        if(this.appState.token === null) {
            console.log('token not set, need auth')
            window.location = "#/authenticate";
        }


    }

    cast_vote() {
        //
    }
}
