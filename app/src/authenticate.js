import {inject} from 'aurelia-framework';
import {ApplicationState} from 'applicationstate';
import {Logic} from 'logic'

@inject(ApplicationState, Logic)
export class Authenticate {

    constructor(appState, logic) {
        this.appState = appState
        this.logic = logic
        this.loaderHidden = true

        window.authenticate = this
    }

    ok() {
        // create new account
        var addr = this.logic.createWallet()
        console.log('new addr: ' + addr)

        // get some funding for it
        this.logic.fundAccount(addr);

        // generate random token
        this.appState.token = this.logic.getRandomToken()

        this.logic.setAddress(addr)

        // (in the final implementation, it should then be blinded and sent to the registry for signing)

        this.loaderHidden = false;

        // simulate remote processing
        setTimeout(() => {
            window.location = "#/vote";
        }, 1500)
    }
}

// http://labs.a-trust.at/developer/
