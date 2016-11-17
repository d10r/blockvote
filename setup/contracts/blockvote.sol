
/*
ERROR CODES

Error 1 = VOTER_ALREADY_ADDED
Error 2 = INVALID_TOKEN
*/

contract Election {
    
    event error(uint);

    struct Candidate {
        string party;
        string name;
    }
    
    struct Voter {
        address addr;
        string token;
    }
    
    // name of the election, e.g. "BP 2016"
    string public name;
    Candidate[] public candidates;
    
    Voter[] public voters;
    mapping(string => uint) tokensMap;
    
    
    // Constructor of the contract
    // todo: start and end date, max name length
    function Election(string _name) {
        name = _name;
    }
    
    // todo: check array size limit
    function addCandidate(string _party, string _name) {
        candidates.push(Candidate({
            party: _party,
            name: _name
        }));
    }
    
    function addVoter(string _token) returns (bool) {
        if(tokensMap[_token] > 0) {
            error(1); // VOTER_ALREADY_ADDED
            return(false);
        }
        if(! isTokenValid(_token)) {
            error(2); // INVALID_TOKEN
            return(false);
        }
        uint newElemIndex = voters.length;
        voters[newElemIndex] = Voter(msg.sender, _token);
        tokensMap[_token] = newElemIndex;
        

        
     //   uint pos = voters.length;
    //    Voters[posmsg.sender]
    }
    
    // checks if the token is valid and signed by the election registrar
    // TODO: implement (see https://gist.github.com/axic/5b33912c6f61ae6fd96d6c4a47afde6d)
    function isTokenValid(string _token) returns (bool) {
        return true;
    }

    function testFunc() returns (uint) {
        return 3;
    }
}
