import 'chart.js'

export class Result {

    constructor() {


    }

    test() {
        var ctx = document.getElementById("chart-area").getContext("2d");

        let result = { "hofer":50,"vdb":46 }

        window.chartColors = {
            red: 'rgb(255, 99, 132)',
            orange: 'rgb(255, 159, 64)',
            blue: 'rgb(0, 0, 255)',
            green: 'rgb(0, 128, 0)',
        }

        var config = {
            type: 'pie',
            data: {
                datasets: [{
                    data: [
                        result['hofer'],
                        result['vdb']
                    ],
                    backgroundColor: [
                        window.chartColors.red,
                        window.chartColors.orange
                    ],
                    label: 'Wahlergebnis'
                }],
                labels: [
                    "Hofer",
                    "van der Bellen"
                ]
            },
            options: {
                responsive: true,
                animation: {
                    animateRotate: true,
                    animateScale: true
                }
            }
        }

        window.myPie = new Chart(ctx, config);

    }
}
