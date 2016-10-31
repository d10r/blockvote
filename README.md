# Modules

* Setup
* Web UI
* Documentation

# Properties

## Registered voters only
There's a voter registry. Voters need to identify themselves in order to get a voting token.
## One voter has one vote
The system needs to assure that a voting token can be used only once.
The implementation will invalidate a token after first use. Could also implemented such that repeated usage of a token overrides the prior votes.
## Verifiability of individual participation
It can be verified if a voter did cast a vote or not.
May be verifiable by everybody or not.
## Verifiability of invidivual vote
It can be verified what choice an individual voter made.
## Verifiablity of result
The public can verify that result reflects the choices on the ballots.
## Coercion resistance
A voter can't prove her choice.

More elaborate analysis: http://naveen.ksastry.com/papers/cryptovoting-usenix05.pdf

# Proposal

The voter identifies with the registry via an electronic id.
Once identified, she sends a blinded token (BT) which was randomly generated on the voter's device (VD). The registry signs the blinded token with public key KR1, and sends the signed blinded token (SBT) back to the voter.
*Registered voters only* fulfilled.

The voter is presented with a user interface for choosing a candidate.
The token is unblinded on VT, resulting in a signed token (ST).
The vote is encrypted with the public key of the electoral committee (KE1), resulting in the encrypted vote EV.
The signed token ST and encrypted vote EV are sent to the district node (DN), which is a node of the distributed blockchain.
A smart contract verifies the signature and rejects the vote if that fails.
Then it hashes the token (HT) and checks if the hash is already present in a list of consumed tokens. If so, the vote is rejected.
Otherwise the hash HT is added to the list of participants (LP).
*One voter has one vote* fulfilled.
Additionally, the token is encrypted with a public key of the electoral committee (KE2) and stored alongside the encrypted vote EV on the blockchain.

Once the election timeframe closes, the electoral committee published the private key for KE1 to a smart contract, triggering vote counting.
The election result becomes publicly available.
*Verifiablity of result* fulfilled.

A voter can't prove her choice, because the token is not stored unencrypted alongside the choice on the blockchain. She can however prove participation at the election by revealing that she has a token which matches a hash in LP.
*Coercion resistance* fulfilled.
*Verifiability of individual participation* fulfilled. (with this implementation, only if the individual voter agrees. Alternative implementations would allow public verifiablity or verifiability by the electoral committee only.

With the agreement of the electoral committee, individual voters can verify if their choice was recorded correctly. In this case the private key for KE2 is used to decrypt the tokens. The voter provides her token in order to lookup the matching entry and can now check if the choice was captured as intended.
*Verifiability of invidivual vote* fulfilled.
The cooperation of the electoral committe makes sure that this property is achieved without losing the property of coercion resistance.
This would required dedicated locations where the voter needs to physically move in order to make the check.

## Scope of the demo

The demo run will not implement the identification with the registry. A kind of dummy may replace it in order to show how it's supposed to work (from a UI perspective) once done.
The security properties may be implemented only partially. E.g. since light client support isn't yet ready for the JS Ethereum client, the UI will delegate operations to a remote node via RPC interface.

# Why Blockchain

A public blockchain removes the necessity for a central, trusted server.
It allows to build a system which reflects the traditional (proved and trusted) organization with voting districts. Every district could provide a Blockchain node to which the associated voters connect. That association could be implemented by having the registry provide node coordinates when signing the token.
Voting observers could be implemented via Blockchain nodes.

# Potential issues

## Vote selling

A malicious voter may sell the registry signed token.
This issue is probably not solvable without a central election location where the voter needs to appear physically for casting the vote.

## Compromised devices

Mobile devices aren't known to be perfectly secure. Unfortunately it's impossible to avoid manipulation of a vote if the voters device is compromised and manipulated accordingly.
The best we can do is probably making it possible to verify individual votes after the election, so at least there's a chance to find out if something went significantly wrong.
A real solution may be usage of dedicated, trusted hardware for the voting process.

## Traceability

The nodes a voter's device connects to may maliciously track and log the IP of the connecting device. That IP may be associated to the vote cast, making it possible to associate IP addresses with votes once the election is over.
In order to avoid this, voter's devices may connect only to nodes they trust or make sure the IP doesn't leak their identity, e.g. by using Tor.

## Majority attack

In case a dedicated chain is used for the election, the hashpower may not be enough to fend off malicious attacks trying to interference with the election.
A possible solution would be to identify a set of authoritative nodes, e.g. nodes dedicated to voting districts, reflecting the traditional structure. Even if arbitrary nodes are allowed to participate, any manipulation attempts will at least be noticed. By contrast, any manipulation attempt by the authoritative nodes will at least be noticed by other nodes, e.g. those of independent citizens or organisations observing the election.
In case such interference makes it impossible to successfully hold an election, there's always the option to use a public chain with enough hashing power. For large scale elections that may however run into scalability and cost issues.

## Scalability

In theory Ethereum doesn't have a limit for blocksize or number of transactions per block.
In practice there's a limit determined by the gas limit set by miners, which at the moment translates to ~15 tx / second (see http://ethereum.stackexchange.com/questions/1034/how-many-transactions-can-the-network-handle). This fluctuates, but the order of magnitude has been that so far.
With a dedicated chain, it should be possible to significantly increase the transaction throughput. Further investigation is required to figure out approximate numbers in order to understand how far it can scale with the current model.

Blocks without transaction have a size of ~530 bytes. Assuming 7200 block per day, that's about 3,8 MB / day.
A simple transaction seems to add ~130 bytes, lets assume 200 bytes / vote.
Would result in a blockchain size of ~200 MB for 1M voters.

## External references

https://www.appvigil.co/blog/2015/06/native-vs-hybrid-apps-security-aspects-of-each-of-the-apps/


# Setup

Creation of dedicated chain on blockvote@e.d10r.net:
```
geth account new
# addr: ae4a95287aaa216c5361db6810d06f28de956c4d
# password: ******
geth init genesis.json
geth --networkid 2016 --rpc --rpcapi "db,eth,net,web3" --rpcaddr 0.0.0.0 --rpcport 2016 --rpccorsdomain "*" --port 32016 --identity blockvote0 --etherbase ae4a95287aaa216c5361db6810d06f28de956c4d --mine --minerthreads 1 js conditionalmining.js
# enode://f64a650831d9b3a0450892c2316cf559213528683a64f408bb16d7161153d528a781fe0ca5de043f2a9ef99fe0d80b6c8b479cf8beaa6fb60fba68435febc14b@5.9.14.88:32016
```
on first run it will take a while to create the DAG.
The file _conditionalmining.js_ is in the setup folder. It disabled mining when no transactions are pending. Avoids wasted CPU cycles during dev.

# Design

User navigates to bp2016.blockvote.org

Landing page:
"Welcome. You're invited to participate in a proof of concept for a blockchain based voting system".
"This system doesn't need a central, trusted authority, is easy to set up, cheap, and it is verifiable."

Call to action: "Get started"

Smaller button, below: "I first want to know more about what this is about and how it works".
(This links to a semi-technical description, probably a github page. This is also a good place for encouraging users to set up a blockchain node for the voting - easy instructions need to be provided, e.g. links to geth builds and exact cmdline for how to run them.)
This page should also highlight the security properties, especially those where the demo compromises.

(Here would be the "get signed token from registry" step. Skipped for now)

This view shows a virtual ballot. It should reflect the view of the paper ballot: http://cdn.salzburg.com/nachrichten/uploads/pics/2016-09/fehlerhafte-wahlkarten-wird-die-bp-stichwahl-verschoben-41-66327366.jpg
The circles are clickable, on click a cross is drawn. When clicking a circle a second time, the cross is removed. When clicking the other circle, the cross switches over.
Below is a big "cast vote" button. Clicking it should also be possible with no candidate selected. In this case a popup should ask for confirmation: "Do you intend to cast a "white vote"?

After click a new screen is shown, with the top label "processing..."
Below: "Your ballot is now encrypted and broadcasted to the blockchain network. It can take some time for it to be confirmed.
Below we may show some live stats, e.g. to how many nodes the vote was broadcasted, when the last block was mined, how many confirmations the ballot already got.

After 4 confirmations, switch to the next screen:
"That's it, thanks!".
Once the voting timeframe is over, the votes will be counted and the result published here.
Technically, we could do live counting, but that would not be conforming with the law.

Alternative: do live counting, but remind that in real use that would be disabled because of the law.

PS: We know that it's easy for anyone with modest technical understanding to cast more then one vote and kindly ask for your cooperation by not doing so. Of course the final system would not allow that, because the virtual ballots would be handed out only to those authenticating with a voting registry system, technically implemented via blind token signature. Look at the white paper (linked) for more details about how it works and what else such a system could offer.

# App

Run on command line:
''npm install -g aurelia-cli''
''au run —watch''

Open Browser:

''http://localhost:9000/#/home''
