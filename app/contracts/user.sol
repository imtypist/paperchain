pragma solidity ^0.4.7;
contract user {
  struct userInfo {
    address paper;
    uint wallet;
    uint sell;
    string username;
    string phone;
    string email;
    string avatar;
    string bio;
    string location;
  }
  
  struct authority {
    bytes32 pid;
    bytes32 session;
    uint lastTime;
    uint register;
    bool isLogin;
  }
  
  struct txInfo {
    bytes20 buyer;
    bytes20 seller;
    uint price;
    uint txDate;
    string fileHash;
  }
  
  mapping (bytes20 => txInfo[]) public txList;

  mapping (bytes20 => userInfo) public users;
  
  mapping (bytes20 => authority) private rbac;
  
  modifier checker(bytes32 ss, bytes20 uid) {
    authority temp = rbac[uid];
    if(now < (temp.lastTime + 30 minutes) && temp.isLogin && temp.session == sha3(ss)) {
      temp.lastTime = now;
      _;
    }
  }
  
  function query(bytes32 ss, bytes20 uid) constant returns (bool){
    authority temp = rbac[uid];
    if(now < (temp.lastTime + 30 minutes) && temp.isLogin && temp.session == sha3(ss)) {
      return true;
    }else {
      return false;
    }
  }

  function register(bytes20 uid, bytes32 pid, string username, string email, string phone) {
    users[uid] = userInfo({
      paper: 0x00,
      wallet: 0,
      username: username,
      email: email,
      avatar: "",
      bio: "",
      location: "",
      sell:0,
      phone:phone
    });
    rbac[uid] = authority({
      pid: pid,
      register: now,
      session: sha3(now),
      lastTime: now,
      isLogin: false
    });
  }
  
  function login(bytes20 uid, string phone, bytes32 pid, bytes32 ss) {
    authority temp = rbac[uid];
    userInfo u = users[uid];
    if(compare(u.phone,phone) && pid == temp.pid) {
      temp.session = sha3(ss);
      temp.lastTime = now;
      temp.isLogin = true;
    }else {
      temp.isLogin = false;
    }
  }

  function logout(bytes32 ss, bytes20 uid) checker(ss, uid) {
    authority temp = rbac[uid];
    temp.session = sha3(now);
    temp.isLogin = false;
  }

  function recharge(bytes32 ss, bytes20 uid, uint money) checker(ss, uid) {
    userInfo u = users[uid];
    u.wallet += money;
  }
  
  function editMyInfo(bytes32 ss, bytes20 uid, string email, string avatar, string bio, string location) checker(ss, uid){
    userInfo u = users[uid];
    u.email = email;
    u.avatar = avatar;
    u.bio = bio;
    u.location = location;
  }
  
  function modifyPasswd(bytes32 ss, bytes20 uid,bytes32 oldPid, bytes32 newPid) checker(ss, uid) {
    authority temp = rbac[uid];
    if(oldPid == temp.pid){
      temp.pid = newPid;
      temp.session = sha3(now);
      temp.isLogin = false;
    }
  }
  
  function setPaperAddr(bytes32 ss, bytes20 uid, address addr) checker(ss, uid) {
    userInfo u = users[uid];
    if(u.paper == 0x00) {
      u.paper = addr;
    }
  }
  
  function paperTx(bytes32 ss, bytes20 uid, bytes20 seller, uint price, string fileHash) checker(ss, uid) {
    if(users[uid].wallet < price) throw;
    txInfo memory tx = txInfo({
        buyer:uid,
        seller:seller,
        price:price,
        fileHash:fileHash,
        txDate:now
    });
    txList[seller].push(tx);
    users[seller].sell += 1;
  }
  
  function doneTx(bytes32 ss, bytes20 uid, uint index, bool result) checker(ss,uid) {
    txInfo tx = txList[uid][index];
    userInfo seller = users[uid];
    userInfo buyer = users[tx.buyer];
    if(result){
        seller.wallet += tx.price;
        buyer.wallet -= tx.price;
    }
    seller.sell -= 1;
    txList[uid].length --;
  }

  function deleteAccount(bytes32 ss, bytes20 uid) checker(ss,uid) {
    delete users[uid];
    delete rbac[uid];
    delete txList[uid];
  }

  function getOtherUserInfo(bytes20 uid) constant returns(address, string, string, string, string, string) {
    userInfo u = users[uid];
    return (u.paper,u.username,u.email,u.avatar,u.bio,u.location);
  }
  
  function getMyInfo(bytes32 ss, bytes20 uid) constant checker(ss, uid) returns(address, uint, string, string, string, string, string) {
    userInfo u = users[uid];
    return (u.paper,u.wallet,u.username,u.email,u.avatar,u.bio,u.location);
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