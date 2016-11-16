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
        // create new account
        var addr = this.logic.createNewAddress()
        console.log('new addr: ' + addr)

        // get some funding for it
        this.logic.fundAccount(addr);

        // generate random token
        this.appState.token = this.logic.getRandomToken()

        // (in the final implementation, it should then be blinded and sent to the registry for signing)

        this.hidden = false;
        setTimeout(() => {
            window.location = "#/vote";
        }, 1500)
    }
}

// http://labs.a-trust.at/developer/
