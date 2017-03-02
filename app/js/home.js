uuid = localStorage.getItem("uid");
session = localStorage.getItem("session");
yourPaperContract = null;
abiOfPaper = [{"constant":true,"inputs":[],"name":"creator","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"author","type":"string"},{"name":"file","type":"string"},{"name":"title","type":"string"},{"name":"isPublic","type":"bool"}],"name":"addPaper","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"index","type":"uint256"},{"name":"author","type":"string"},{"name":"file","type":"string"},{"name":"title","type":"string"},{"name":"isPublic","type":"bool"}],"name":"editPaper","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"fileHash","type":"string"}],"name":"deletePaper","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"len","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"papers","outputs":[{"name":"author","type":"string"},{"name":"fileHash","type":"string"},{"name":"title","type":"string"},{"name":"date","type":"uint256"},{"name":"isPublic","type":"bool"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"}];
EmbarkJS.Storage.setProvider('ipfs',{server: 'localhost', port: '5001'});

$(function () {
  getMyInfo(session,uuid);

  $("#profile-dropdown").click(function () {
    $("#menu").toggle();
  });

  $("#add_new").click(function () {
    $("#loadfile").show();
  });

  $(".main__close___1LpZv").click(function () {
    $("#loadfile").hide();
  });

  $(".setting").click(function () {
    window.location.href="./change.html";
  });

  $(document).on("click","#selectFile",function(){
    $("#fileContainer").click();
  });

  $(document).on("change","#fileContainer",function(){
    var fname = $("#fileContainer").val();
    if(fname != ""){
      $("fileName").text(fname);
    }else{
      $("fileName").text(0);
    }
  });

  $(document).on("click","#uploadFile",function(){
    var input = $("#fileContainer");
    EmbarkJS.Storage.uploadFile(input).then(function(hash) {
      console.log(hash);
      $("#loadfile").hide();
    });
  });

});

/*
 * @function:getMyInfo()
 */
function getMyInfo(session,uid){
  user.getMyInfo(session,uid).then(function(res){
    $("#username").text(res[3]);
    if(res[0] == "0x0000000000000000000000000000000000000000"){
      PaperCopyright.deploy().then(function(newContract){
        console.log(newContract.address);
        user.setPaperAddr(session,uuid,newContract.address,{gas:500000}).then(function(res){
          var setPaper = setInterval(function(){
            var currentBlock = web3.eth.blockNumber;
            var txBlock = web3.eth.getTransaction(res).blockNumber;
            if(txBlock != null && currentBlock - txBlock >= 2){
              clearInterval(setPaper);
              yourPaperContract = newContract;
            }
          },1000);
        });
      });
    }else{
      yourPaperContract = new EmbarkJS.Contract({abi: abiOfPaper, address: res[0]});
      yourPaperContract.len().then(function(res){
        var paperNum = res.toNumber();
        if(paperNum > 0){
          $("#noPaper").hide();
        }
        $("#paperNumber").text(paperNum);
      });
    }
  });
}

