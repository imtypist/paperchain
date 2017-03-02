pragma solidity ^0.4.7;
contract user {
  struct userInfo {
    bytes20 paper;
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

  mapping (bytes20 => userInfo) public users;
  
  mapping (bytes20 => authority) private rbac;
  
  modifier checker(string ss, bytes20 uid) {
    authority temp = rbac[uid];
    if(now < (temp.lastTime + 30 minutes) && temp.isLogin && temp.session == sha3(ss)) {
      temp.lastTime = now;
      _;
    }
  }
  
  function query(string ss, bytes20 uid) constant returns (bool){
    authority temp = rbac[uid];
    if(now < (temp.lastTime + 30 minutes) && temp.isLogin && temp.session == sha3(ss)) {
      return true;
    }else {
      return false;
    }
  }

  function register(bytes20 uid, string pid, string username, string email) {
    users[uid] = userInfo({
      paper: 0x00,
      register: now,
      wallet: 0,
      username: username,
      email: email,
      avatar: "ipfs url",
      bio: "",
      location: ""
    });
    rbac[uid] = authority({
      pid: sha3(pid),
      session: sha3(now),
      lastTime: now,
      isLogin: false
    });
  }
  
  function login(bytes20 uid, string email, string pid, string ss) {
    authority temp = rbac[uid];
    userInfo u = users[uid];
    if(compare(u.email,email) && sha3(pid) == temp.pid) {
      temp.session = sha3(ss);
      temp.lastTime = now;
      temp.isLogin = true;
    }else {
      temp.isLogin = false;
    }
  }

  function logout(string ss, bytes20 uid) checker(ss, uid) {
    authority temp = rbac[uid];
    temp.session = sha3(now);
    temp.isLogin = false;
  }
  
  function editMyInfo(string ss, bytes20 uid, string email, string avatar, string bio, string location) checker(ss, uid){
    userInfo u = users[uid];
    u.email = email;
    u.avatar = avatar;
    u.bio = bio;
    u.location = location;
  }
  
  function modifyPasswd(string ss, bytes20 uid,string oldPid, string newPid) checker(ss, uid) {
    authority temp = rbac[uid];
    if(sha3(oldPid) == temp.pid){
      temp.pid = sha3(newPid);
      temp.session = sha3(now);
      temp.isLogin = false;
    }
  }
  
  function setPaperAddr(string ss, bytes20 uid, bytes20 addr) checker(ss, uid) {
    userInfo u = users[uid];
    if(u.paper == 0x00) {
      u.paper = addr;
    }
  }

  function getOtherUserInfo(bytes20 uid) constant returns(bytes20, uint, string, string) {
    userInfo u = users[uid];
    return (u.paper,u.register,u.username,u.email);
  }
  
  function getMyInfo(string ss, bytes20 uid) constant checker(ss, uid) returns(bytes20, uint, uint, string, string) {
    userInfo u = users[uid];
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
