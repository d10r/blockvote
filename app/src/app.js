import $ from 'jquery';
import 'bootstrap';

export class App {

  constructor() {
    this.message = 'Hello World!';
  }

  configureRouter(config, router) {
    config.title = 'Aurelia';
    config.map([
      { route: ['','home'], name: 'home', moduleId: 'home', nav: true },
      { route: 'vote', name: 'vote', moduleId: 'vote', nav: true },
    ]);
    this.router = router;
  }
}
