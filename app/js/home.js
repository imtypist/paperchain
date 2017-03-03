uuid = localStorage.getItem("uid");
session = localStorage.getItem("session");
yourPaperContract = null;
abiOfPaper = [{"constant":true,"inputs":[],"name":"creator","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"author","type":"string"},{"name":"file","type":"string"},{"name":"title","type":"string"},{"name":"isPublic","type":"bool"}],"name":"addPaper","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"index","type":"uint256"},{"name":"author","type":"string"},{"name":"file","type":"string"},{"name":"title","type":"string"},{"name":"isPublic","type":"bool"}],"name":"editPaper","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"fileHash","type":"string"}],"name":"deletePaper","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"len","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"papers","outputs":[{"name":"author","type":"string"},{"name":"fileHash","type":"string"},{"name":"title","type":"string"},{"name":"date","type":"uint256"},{"name":"isPublic","type":"bool"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"}];
EmbarkJS.Storage.setProvider('ipfs',{server: 'localhost', port: '5001'});
fileHash = null;
isPublic = true;

var paperList = avalon.define({
  $id:"paperList",
  data:[]
});

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

  $("#fileContainer").change(function(){
    var fname = $("#fileContainer").val();
    if(fname != ""){
      $("#fileName").text(fname);
    }else{
      $("#fileName").text(0);
    }
  });

  /*
   * @event:copyright
   */
  $(document).on("click","#uploadFile",function(){
    var input = $("#fileContainer");
    var paperName = $("#paperName").val();
    if(input.val() == "" || paperName == "") return false;
    $("#uploadFile").attr("id","txing");
    EmbarkJS.Storage.uploadFile(input).then(function(hash) {
      fileHash = hash;
      yourPaperContract.addPaper($("#username").text(),fileHash,paperName,isPublic,{gas:500000}).then(function(res){
        var addPP = setInterval(function(){
          var currentBlock = web3.eth.blockNumber;
          var txBlock = web3.eth.getTransaction(res).blockNumber;
          if(txBlock != null && currentBlock - txBlock >= 1){
            clearInterval(addPP);
            $("#txing").attr("id","uploadFile");
            $("#noPaper").hide();
            alert("success!");
            var paperNum = parseInt($("#paperNumber").text()) + 1;
            $("#paperNumber").text(paperNum);
            paperList.data = [];
            for(var i = 0;i < paperNum;i++){
              yourPaperContract.papers(i).then(function(value){
                paperList.data.push({
                  "title":value[2],
                  "hash":value[1]
                });
              });
            }
            $("#loadfile").hide();
          }
        },1000);
        
      });
    });
  });

  /*
     * @event: tx is doing
     */
    $(document).on("click","#txing",function(){
      alert("tx is doing...");
    });

});

/*
 * @function:getMyInfo()
 */
function getMyInfo(session,uid){
  user.getMyInfo(session,uid).then(function(res){
    $("#username").text(res[3]);
    if(res[5] != "ipfs url"){
      var ipfsUrl = EmbarkJS.Storage.getUrl(res[5]);
      $(".avatar").attr("src",ipfsUrl);
    }
    if(res[0] == "0x0000000000000000000000000000000000000000"){
      PaperCopyright.deploy().then(function(newContract){
        user.setPaperAddr(session,uuid,newContract.address,{gas:500000}).then(function(res){
          var setPaper = setInterval(function(){
            var currentBlock = web3.eth.blockNumber;
            var txBlock = web3.eth.getTransaction(res).blockNumber;
            if(txBlock != null && currentBlock - txBlock >= 1){
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
        paperList.data = [];
        for(var i = 0;i < paperNum;i++){
          yourPaperContract.papers(i).then(function(value){
            paperList.data.push({
              "title":value[2],
              "hash":value[1]
            });
          });
        }
      });
    }
  });
}

