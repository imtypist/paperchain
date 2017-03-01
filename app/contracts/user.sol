pragma solidity ^0.4.7;
contract user {
  struct userInfo {
    address paper;
    uint register;
    uint wallet;
    string username;
    string email;
    string avatar;
    string bio;
    string location;
  }
  
  struct authority {
    bytes32 pid;
    bytes32 session;
    uint lastTime;
    bool isLogin;
  }

  mapping (address => userInfo) public users;
  
  mapping (address => authority) private rbac;
  
  modifier checker(string ss) {
    authority temp = rbac[msg.sender];
    if(now < (temp.lastTime + 30 minutes) && temp.isLogin && temp.session == sha3(ss)) {
      temp.lastTime = now;
      _;
    }
  }
  
  function query(string ss) constant returns (bool){
    authority temp = rbac[msg.sender];
    if(now < (temp.lastTime + 30 minutes) && temp.isLogin && temp.session == sha3(ss)) {
      return true;
    }else {
      return false;
    }
  }

  function register(string pid, string username, string email) {
    users[msg.sender] = userInfo({
      paper: 0x00,
      register: now,
      wallet: 0,
      username: username,
      email: email,
      avatar: "ipfs url",
      bio: "",
      location: ""
    });
    rbac[msg.sender] = authority({
      pid: sha3(pid),
      session: sha3(now),
      lastTime: now,
      isLogin: false
    });
  }
  
  function login(string email, string pid, string ss) {
    authority temp = rbac[msg.sender];
    userInfo u = users[msg.sender];
    if(compare(u.email,email) && sha3(pid) == temp.pid) {
      temp.session = sha3(ss);
      temp.lastTime = now;
      temp.isLogin = true;
    }else {
      temp.isLogin = false;
    }
  }

  function logout(string ss) checker(ss) {
    authority temp = rbac[msg.sender];
    temp.session = sha3(now);
    temp.isLogin = false;
  }
  
  function editMyInfo(string ss, string email, string avatar, string bio, string location) checker(ss){
    userInfo u = users[msg.sender];
    u.email = email;
    u.avatar = avatar;
    u.bio = bio;
    u.location = location;
  }
  
  function modifyPasswd(string ss, string oldPid, string newPid) checker(ss) {
    authority temp = rbac[msg.sender];
    if(sha3(oldPid) == temp.pid){
      temp.pid = sha3(newPid);
      temp.session = sha3(now);
      temp.isLogin = false;
    }
  }
  
  function setPaperAddr(string ss, address addr) checker(ss) {
    userInfo u = users[msg.sender];
    if(u.paper == 0x00) {
      u.paper = addr;
    }
  }

  function getOtherUserInfo(address uid) constant returns(address, uint, string, string) {
    userInfo u = users[uid];
    return (u.paper,u.register,u.username,u.email);
  }
  
  function getMyInfo(string ss) constant checker(ss) returns(address, uint, uint, string, string) {
    userInfo u = users[msg.sender];
    return (u.paper,u.register,u.wallet,u.username,u.email);
  }
  
  function compare(string storage _a, string memory _b) internal returns (bool) {
    bytes storage a = bytes(_a);
    bytes memory b = bytes(_b);
    if (a.length != b.length)
    	return false;
    // @todo unroll this loop
    for (uint i = 0; i < a.length; i ++)
    	if (a[i] != b[i])
    		return false;
    return true;
  }

}
