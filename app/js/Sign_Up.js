$(function () {
    $("#sign_up").click(function () {
        window.location.href = "./signUp.html";
    });


    /*
	 * @event:click button
	 * @id:register 
     */
    $(document).on("click","#register",function(){
    	var name = $("#username").val();
    	var email = $("#email").val();
    	var passwd = $("#password").val();
    	if(name == "" || email == "" || passwd == "") return false;
        $("#register").attr("id","txing");
    	var uid = generateAddr();
    	user.register(uid,passwd,name,email,{gas:500000}).then(function(res){
            var tx = setInterval(function(){
                var currentBlock = web3.eth.blockNumber;
                var txBlock = web3.eth.getTransaction(res).blockNumber;
                if(txBlock != null && currentBlock - txBlock >= 1){
                    clearInterval(tx);
                    $("#txing").attr("id","register");
                    localStorage.setItem("uid",uid);
                    alert("Your address:" + uid);
                    window.location.href = "./login.html";
                }
            },1000);
    	});
    });

    /*
     * @event:tx is doing
     */
    $(document).on("click","#txing",function(){
        alert("tx is doing...");
    });
});

/*
 * @function:make random address
 */
function generateAddr() {
	var chars = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
	var res = "";
	for(var i = 0; i < 40 ; i ++) {
	    var id = Math.ceil(Math.random()*15);
	    res += chars[id];
	}
	return '0x' + res;
}
