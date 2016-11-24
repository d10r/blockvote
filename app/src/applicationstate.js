import {Cookie} from 'aurelia-cookie';

// TODO: get the cookie thing working
export class ApplicationState {
    constructor() {
        this.token = Cookie.get('token')
        console.log('appstate ctor - token: ' + this.token)
    }

    isTokenSet() {
        return this.token != null
    }

    persist() {
        if(this.token)
            Cookie.set('token', this.token, {
                expiry: 24, // hours
                path: '',
                domain: '',
                secure: true
            })
    }

    reset() {
        Cookie.delete('token')
    }
}