/*globals $, SimpleStorage, document*/

var addToLog = function(id, txt) {
  $(id + " .logs").append("<br>" + txt);
};

console.log(web3.isConnected());

var abiObject = [{"constant":true,"inputs":[],"name":"creator","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"len","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"papers","outputs":[{"name":"author","type":"string"},{"name":"fileHash","type":"string"},{"name":"title","type":"string"},{"name":"date","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"index","type":"uint256"},{"name":"author","type":"string"},{"name":"file","type":"string"},{"name":"title","type":"string"}],"name":"edit","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"author","type":"string"},{"name":"file","type":"string"},{"name":"title","type":"string"}],"name":"add","outputs":[],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"}];

$(document).ready(function() {
  var addr;
  var instance;
  checker.checkUser().then(function(res) {
    if(res[0]){
      addr = res[1].toString();
      instance = new EmbarkJS.Contract({abi: abiObject, address: addr});
    }else{
      PaperCopyright.deploy().then(function(newContract){
        instance = newContract;
        checker.addUser.sendTransaction(instance.address,{gas:500000});
      });
    }
    // ===========================
    // Blockchain example
    // ===========================
      $("#blockchain button.set").click(function() {
        var value = $("#blockchain input.text").val().split(',');
        var fileHash = $("#blockchain input.fileIpfsHash").val();
        if(fileHash == ""){
            alert("fileHash can not be null");
            return false;
        }
        instance.add.sendTransaction(value[0],fileHash,value[1],{gas:1000000});
        addToLog("#blockchain", "PaperCopyright.set(" + value[0] + "," + fileHash + "," + value[1] + ")");
      });

      $("#blockchain button.get").click(function() {
        instance.len().then(function(len){
          instance.papers(len.toNumber()-1).then(function(paper){
            $("#blockchain span.value").text(paper.toString());
	        addToLog("#blockchain", "PaperCopyright.papers("+ (len.toNumber()-1) +")");
          });
        });
      });

    // ===========================
    // Storage (IPFS) example
    // ===========================

      EmbarkJS.Storage.setProvider('ipfs',{server: 'localhost', port: '5001'});

      $("#storage button.uploadFile").click(function() {
        var input = $("#storage input[type=file]");
        EmbarkJS.Storage.uploadFile(input).then(function(hash) {
          $("span.fileIpfsHash").html(hash);
          $("input.fileIpfsHash").val(hash);
        });
        addToLog("#storage", "EmbarkJS.Storage.uploadFile($('input[type=file]')).then(function(hash) { })");
      });

      $("#storage button.loadIpfsFile").click(function() {
        var hash = $("#storage input.fileIpfsHash").val();
        var url = EmbarkJS.Storage.getUrl(hash);
        var link = '<a href="' + url + '" target="_blank">' + url + '</a>';
        $("span.ipfsFileUrl").html(link);
        $(".ipfsImage").attr('src', url);
        addToLog("#storage", "EmbarkJS.Storage.getUrl('" + hash + "')");
      });
  });

  $("#Information button.set").click(function() {
    var otherAddr = $("#Information .addr").eq(0).val();
    var str = "";
    checker.users(otherAddr).then(function(addr) {
      var getOther = new EmbarkJS.Contract({abi: abiObject, address: addr});
      str += "<br>address: " + getOther.address;
      getOther.len().then(function(value) {
        str += "<br>numOfPaper: " + value.toNumber();
        for(var i = 0;i < value.toNumber();i++){
	  getOther.papers(i).then(function(s){
	    str += "<br>" + s.toString();
	  });
        }
        setTimeout(function(){$("#Information .value").html(str);},1000);
      });
    });
  });
});
