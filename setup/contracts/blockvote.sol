pragma solidity ^0.4.4;

/*
ERROR CODES

Error 1 = NO_PERMISSION
Error 2 = ALREADY_VOTED
Error 3 = INVALID_TOKEN
*/

contract Election {

// ############## EVENTS ##############

    event error(uint);
    event log(string);
    event voteEvent(string);

// ############## STRUCTS ##############

    struct Candidate {
        string name;
    }
    
    struct Voter {
        address addr;
        string token;
        string vote;
        uint candidateId;
    }

    enum Stage {
        PRE_VOTING,
        VOTING,
        POST_VOTING
    }

// ############## FIELDS ##############

    // contract owner becomes admin
    address public admin;
    Stage public currentStage = Stage.PRE_VOTING;

    // name of the election, e.g. "BP 2016"
    string public name;
    Candidate[] public candidates;
    
    Voter[] public voters;


// ############## PUBLIC FUNCTIONS ##############

    // Constructor of the contract
    function Election(string _name) {
        admin = msg.sender;
        name = _name;
    }

    function addCandidate(string _name) requiresAdmin preVoting {
        candidates.push(Candidate({
            name: _name
        }));
        log("candidate added");
    }

    function startElection() preVoting {
        currentStage = Stage.VOTING;
    }

    function stopElection() voting {
        currentStage = Stage.POST_VOTING;
    }
    
    function vote(string _token, string _vote, uint _candidateId) voting returns(uint) {
        if(alreadyVoted(_token)) return 2; // ALREADY_VOTED
        if(! isTokenValid(_token)) return 3; // INVALID_TOKEN

        // check vote validity

        voters.push(Voter({
            addr: msg.sender,
            token: _token,
            vote: _vote,
            candidateId: _candidateId
        }));
        voteEvent(_token);
        return 0;
    }

    function getResult() postVoting returns(uint[]) {
        uint[] memory votes;
        for(var i=0; i<voters.length; i++) {
            var candidateIndex = voteToCandidateIndex(i);
            if(candidateIndex >= 0) {
                votes[candidateIndex]++;
            }
        }
        return votes;
    }

// ############## MODIFIERS ##############

modifier requiresAdmin {
    if(msg.sender != admin) throw;
    _;
}

modifier preVoting {
    if(currentStage != Stage.PRE_VOTING) throw;
    _;
}

modifier voting {
    if(currentStage != Stage.VOTING) throw;
    _;
}

modifier postVoting {
    if(currentStage != Stage.POST_VOTING) throw;
    _;
}

// ############## PRIVATE FUNCTIONS ##############

    function alreadyVoted(string _token) returns(bool) {
        for(var i=0; i<voters.length; i++) {
            if(compareStrings(voters[i].token, _token) == 0) {
                return true;
            }
        }
        return false;
    }

    // checks if the token is valid and signed by the election registrar
    // TODO: implement (see https://gist.github.com/axic/5b33912c6f61ae6fd96d6c4a47afde6d)
    function isTokenValid(string _token) returns (bool) {
        return true;
    }

    function voteToCandidateIndex(uint _voterId) returns(uint) {
        return voters[_voterId].candidateId;
    }

    // from https://raw.githubusercontent.com/ethereum/dapp-bin/master/library/stringUtils.sol
    function compareStrings(string _a, string _b) returns (int) {
        bytes memory a = bytes(_a);
        bytes memory b = bytes(_b);
        uint minLength = a.length;
        if (b.length < minLength) minLength = b.length;
        //@todo unroll the loop into increments of 32 and do full 32 byte comparisons
        for (uint i = 0; i < minLength; i ++)
            if (a[i] < b[i])
                return -1;
            else if (a[i] > b[i])
                return 1;
        if (a.length < b.length)
            return -1;
        else if (a.length > b.length)
            return 1;
        else
            return 0;
    }

// ############## TESTS ###############

    function testFunc() returns (uint) {
        return 3;
    }

    function multiply(uint _n1, uint _n2) returns (uint) {
        return _n1 * _n2;
    }


    function testEvents() {
        error(1);
        log("this is a test");
    }

    function testEvent2() {

    }
}
