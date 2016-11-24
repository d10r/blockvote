set -u
set -e

node main.js --compile contracts/blockvote.sol --create demo
node main.js --config addCandidate Hans
node main.js --config addCandidate Franz
node main.js --config startElection
