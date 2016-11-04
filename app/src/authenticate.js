export class Authenticate {

  constructor() {
    this.hidden = true;
  }

  ok() {
    this.hidden = false;
    setTimeout(() = > {
      window.location = "#/vote";
  },
    3000
  )
    ;
  }
}

// http://labs.a-trust.at/developer/
