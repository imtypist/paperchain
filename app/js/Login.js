uuid = localStorage.getItem("uid");

$(function () {
    $("#sign_up").click(function () {
        window.location.href = "./signUp.html";
    });

    /*
     * @event:login
     */
    $(document).on("click","#login",function(){
    	var email = $("#email").val();
    	var passwd = $("#password").val();
    	if(email == "" || passwd == "" || !checkUid()) return false;
    	$("#login").attr("id","txing");
		var now = new Date();
		session = localStorage.getItem("session");
		localStorage.setItem("session",now.getTime());
    	session = localStorage.getItem("session");
    	console.log(uuid,email,passwd,session);
    	user.login(uuid,email,passwd,session,{gas:500000}).then(function(res){
    		var q = setInterval(function(){
    			var currentBlock = web3.eth.blockNumber;
    			var txBlock = web3.eth.getTransaction(res).blockNumber;
    			if(currentBlock - txBlock >= 2 && txBlock != null){
    				clearInterval(q);
    				user.query(session,uuid).then(function(val){
    					$("#txing").attr("id","login");
    					if(val == true){
    						alert("success!");
    					}else{
    						alert("failure!");
    					}
    				});
    			}
    		},1000);
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
 * @function:check uid
 */
function checkUid(){
	if(uuid != null) 
		return true;
	else{
		uuid = prompt("Please enter your address:",'such as:0xc89b8a31777aba699318955324b84b39d87b43a2');
		if(uuid != null)
			localStorage.setItem("uid",uuid);
		return false;
	}
}