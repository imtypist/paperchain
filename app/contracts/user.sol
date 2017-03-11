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
    uint buy;
    uint sell;
  }
  
  struct authority {
    bytes32 pid;
    bytes32 session;
    uint lastTime;
    bool isLogin;
  }
  
  struct txInfo {
    bytes20 buyer;
    bytes20 seller;
    uint price;
    string fileHash;
    uint txDate;
  }
  
  mapping (bytes20 => txInfo[]) private txBuyer;
  
  mapping (bytes20 => txInfo[]) private txSeller;

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
      avatar: "",
      bio: "",
      location: "",
      buy:0,
      sell:0
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

  function recharge(string ss, bytes20 uid, uint money) checker(ss, uid) {
    userInfo u = users[uid];
    u.wallet += money;
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
  
  function setPaperAddr(string ss, bytes20 uid, address addr) checker(ss, uid) {
    userInfo u = users[uid];
    if(u.paper == 0x00) {
      u.paper = addr;
    }
  }
  
  function paperTx(string ss, bytes20 uid, bytes20 seller, uint price, string fileHash) checker(ss, uid) {
    if(users[uid].wallet < price) throw;
    txInfo memory tx = txInfo({
        buyer:uid,
        seller:seller,
        price:price,
        fileHash:fileHash,
        txDate:now
    });
    txBuyer[uid].push(tx);
    users[uid].buy += 1;
    txSeller[seller].push(tx);
    users[seller].sell += 1;
  }
  
  function doneTx(string ss, bytes20 uid, uint index, bool result) checker(ss,uid) {
    txInfo tx = txSeller[uid][index];
    userInfo seller = users[uid];
    userInfo buyer = users[tx.buyer];
    if(result){
        seller.wallet += tx.price;
        buyer.wallet -= tx.price;
    }
    seller.sell -= 1;
    buyer.buy -= 1;
    txSeller[uid].length --;
    txBuyer[tx.buyer].length --;
  }

  function deleteAccount(string ss, bytes20 uid) checker(ss,uid) {
    delete users[uid];
    delete rbac[uid];
    delete txSeller[uid];
    delete txBuyer[uid];
  }

  function getOtherUserInfo(bytes20 uid) constant returns(address, uint, string, string, string, string, string) {
    userInfo u = users[uid];
    return (u.paper,u.register,u.username,u.email,u.avatar,u.bio,u.location);
  }
  
  function getMyInfo(string ss, bytes20 uid) constant checker(ss, uid) returns(address, uint, uint, string, string, string, string, string) {
    userInfo u = users[uid];
    return (u.paper,u.register,u.wallet,u.username,u.email,u.avatar,u.bio,u.location);
  }
  
  function txNum(string ss, bytes20 uid) constant checker(ss, uid) returns(uint, uint){
    userInfo u = users[uid];
    return (u.buy,u.sell);
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
