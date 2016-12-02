import {inject} from 'aurelia-framework'
import {ApplicationState} from 'applicationstate'
import {Logic} from 'logic'
import 'chart.js'

@inject(ApplicationState, Logic)
export class Processing {

    constructor(appState, logic) {
        this.appState = appState
        this.logic = logic

        if (! this.appState.isTokenSet()) {
            console.log('token not set, need auth')
            window.location = "#/authenticate";
        }

        this.rows = [];
        this.i = 0;
        //this.fill();

        this.listenForVotes()
        this.waitForResult()
    }


    electionStatusObserver() {
        if(this.logic.electionStatus == 2) {
            // present result

        }
    }

    waitForResult() {
        this.logic.getElectionResultPromise().then( () => {
            this.createResultChart(this.logic.electionResult)
        })
    }

    listenForVotes() {
        console.log('install voteListener')
        this.logic.watchVotes( (event) => {
            // let eventStr = `neue Stimme: Block ${event.blockNumber} - Transaktion ${event.transactionHash}`
            let eventStr = 'neue Stimme | Block ' + event.blockNumber + ' - Transaktion: ' + event.transactionHash + ' - Gesamtstimmen: ' + event.args['']
            this.rows.push( { msg: eventStr } )
            this.scrollTop()
        } )
    }

    testPopulateList(nrItems) {
        for(let i = 0; i < nrItems; i++) {
            let str = 'neue Stimme | Block 194 - Transaktion: 0x538a60fe906c385c8944cdd3ed7398e6f18b418118937395031c5aae3dd2bae2 - Gesamtstimmen: 111'
            this.rows.push({msg: str})
        }
    }

    scrollTop() {
        // automatically scroll if scrolled to the bottom. Allows manual override
        let listElem = $('#live-votes')
        let scrollPercent = (100 - (listElem.height() - listElem.scrollTop()) * 100 / listElem.height())
        if(scrollPercent > 95)
            listElem.stop().animate({scrollTop: listElem[0].scrollHeight}, 800)
    }

    /*
    refresh() {
        // this.fill()
        $('.scrollable').stop().animate({
            scrollTop: $('.scrollable')[0].scrollHeight
        }, 800);
    }
    */

    // this assumes a result object of the form {'hofer': <int>,'vdb': <int>}
    createResultChart(result) {
        console.log('creating chart')
        var ctx = document.getElementById("chart-area").getContext("2d");

        // testing hack
        if(! result)
            result = { "hofer":50,"vdb":50 }

        window.chartColors = {
            red: 'rgb(255, 99, 132)',
            orange: 'rgb(255, 159, 64)',
            blue: 'rgb(0, 0, 255)',
            green: 'rgb(0, 128, 0)',
        }

        console.log('hofer' + result['hofer'])
        console.log('vdb:' + result['vdb'])

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
