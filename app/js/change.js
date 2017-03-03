uuid = localStorage.getItem("uid");
session = localStorage.getItem("session");
EmbarkJS.Storage.setProvider('ipfs',{server: 'localhost', port: '5001'});
avatarUrl = null;

$(function () {
    getMyInfo(session,uuid);

   $(".nav-link").click(function () {
       window.location.href = "home.html";
   });

    $("#list>a").click(function () {
        var index = $(this).index();
        for(i=0;i<($(".option").length);i++)
        {
            if (i==index)
            {
                $(".option").eq(i).show();
            }
            else {
                $(".option").eq(i).hide();
            }
        }
    });

    $("#profile-dropdown").click(function () {
        $("#menu").toggle();
    });

    $(".personal_index").click(function () {
        window.location.href ="home.index";
    });

    $(".setting").click(function () {
        window.location.href="change.html"
    });

    $(document).on("click","#upAvatar",function(){
        $("#avatar").click();
    });

    $("#avatar").change(function(){
        var url = $("#avatar");
        if(url.val() != ""){
            EmbarkJS.Storage.uploadFile(url).then(function(hash) {
              var ipfsUrl = EmbarkJS.Storage.getUrl(hash);
              user.editMyInfo(session,uuid,$("#email").val(),hash,$("#bio").val(),$("#location").val(),{gas:600000}).then(function(res){
                var setAvatar = setInterval(function(){
                    var currentBlock = web3.eth.blockNumber;
                    var txBlock = web3.eth.getTransaction(res).blockNumber;
                    if(txBlock != null && currentBlock - txBlock >= 1){
                      clearInterval(setAvatar);
                      $(".ipfs_img").attr("src",ipfsUrl);
                      alert("success!");
                    }
                  },1000);
              });
            });
        }
    });

});

function getMyInfo(session,uid){
    user.getMyInfo(session,uid).then(function(res){
        $("span.username").text(res[3]);
        $("input.username").val(res[3]);
        $("#email").val(res[4]);
        if(res[5] != "ipfs url"){
            var ipfsUrl = EmbarkJS.Storage.getUrl(res[5]);
            $(".ipfs_img").attr("src",ipfsUrl);
        }
        $("#bio").text(res[6]);
        $("#location").text(res[7]);
    });
}

