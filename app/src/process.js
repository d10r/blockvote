export class Processing {

  constructor() {
    this.rows = [];
    this.i = 0;
    this.fill();
  }

  fill() {
    for (var i = 0; i < 30; i++) {
      this.i += i;
      this.rows.push({
        msg: "Stimme für van der Bellen " + this.i
      });
      this.rows.push({
        msg: "Stimme für van der Wuf " + this.i
      });
      this.rows.push({
        msg: "Stimme vergessen " + this.i
      });
    }
  }

  refresh() {
    this.fill()
    $('.scrollable').stop().animate({
      scrollTop: $('.scrollable')[0].scrollHeight
    }, 800);
  }
}
