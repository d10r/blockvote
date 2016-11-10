import {inject} from 'aurelia-framework';
import {ApplicationState} from 'applicationstate';
import {Logic} from 'logic'

@inject(ApplicationState, Logic)
export class Authenticate {

    constructor(appState, logic) {
        this.appState = appState
        this.logic = logic
        this.hidden = true;
    }

    ok() {
        // generate random token
        this.appState.token = this.logic.getRandomToken()

        // (in the final implementation, it should then be blinded and sent to the registry for singning)


        this.hidden = false;
        setTimeout(() => {
            window.location = "#/vote";
        }, 1500)
    }
}

// http://labs.a-trust.at/developer/
