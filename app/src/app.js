import $ from 'jquery';
import 'bootstrap';

export class App {

    constructor() {
        this.message = 'Hello World!';
    }

    configureRouter(config, router) {
        config.title = 'Aurelia';
        config.map([
            {route: ['', 'home'], name: 'home', moduleId: 'home', nav: true},
            {route: 'authenticate', name: 'authenticate', moduleId: 'authenticate', nav: true},
            {route: 'vote', name: 'vote', moduleId: 'vote', nav: true},
            {route: 'process', name: 'process', moduleId: 'process', nav: true},
            {route: 'result', name: 'result', moduleId: 'result', nav: true},
            {route: 'about', name: 'about', moduleId: 'about', nav: true},
        ]);
        this.router = router;
    }
}
