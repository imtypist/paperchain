var address;
var session;
refresh();
var contractOfPaper;
EmbarkJS.Storage.setProvider('ipfs',{server: 'localhost', port: '5001'});

var userInfo = avalon.define({
	$id:"userInfo",
	paper:[],
	wallet:"",
	username:"username",
	email:"",
	hash:"",
	avatar:"img/unnamed.jpg",
	bio:"",
	location:"",
	address:address,
	len:0,
	sell:0,
	txInfo:{}
});

$(function(){
	/* position:首页
	 * event:跳转
	 * branch 0:无address，跳转注册/恢复addr
	 * branch 1:有address，跳转登录
	 */
	$(document).on("click","#yellow",function(){
		refresh();
		if(address == null){
			slidePage("blackcolor",false,"yellowback","createwalletpgs","newuser","block");
		}else{
			$("#intro").removeClass("iron-selected");
			$("#vault").addClass("iron-selected");	
			slidePage("blackcolor",false,"yellowback","createwalletpgs","unlock","block");
		}
	});
	/* position:intro下的页面通用
	 * event:跳转回首页
	 */
 	$(document).on("click","#intro #icon",function(){
		slidePage("blackcolor",true,"yellowback","createwalletpgs","welcome","none","blueback");
	});
 	/* position:注册/恢复addr页面
 	 * event:跳转到注册前须知页面
 	 */
	$(document).on("click","#createNewUser",function(){
		slidePage("blackcolor",true,"blueback","createwalletpgs","first","block");
	});
	/* position:注册前须知页面
	 * event:不同意返回首页
	 */
	$(document).on("click","#convertToken",function(){
		slidePage("blackcolor",true,"yellowback","createwalletpgs","welcome","none","blueback");
	});
	/* position:恢复address页面
	 * event:跳转登录页
	 */
	$(document).on("click","#restoreJumpToLogin",function(){
		slidePage("blackcolor",false,"blueback","vaultPage","unlock","block");
	});
	/* position:登陆页面
	 * event:跳转提示是否从设备上删除账户
	 */
	$(document).on("click","#unlock iron-icon:eq(0)",function(){
		slidePage("blackcolor",false,"blueback","vaultPage","completeclearvault","none");
	});
	/* position:提示是否从设备上删除账户页面
	 * event:从设备上删除
	 */
	$(document).on("click","#removefromdevice",function(){
		localStorage.removeItem("uid");
		refresh();
		$("#vault").removeClass("iron-selected");
		$("#intro").addClass("iron-selected");
		slidePage("blackcolor",true,"yellowback","vaultPage","welcome","none");
	});
	/* position:提示是否从设备上删除账户页面
	 * event:跳转回登录页面
	 */
	$(document).on("click","#cancelremovefromdevice",function(){
		slidePage("blackcolor",false,"blueback","vaultPage","unlock","block");
	});
	/* position:登陆页面
	 * event:进入home页面
	 */
	$(document).on("click","#unlock iron-icon:eq(1)",function(){
		var email = $("#login_email").val();
		if(!checkEmail(email)){
			alert("enter your email");
			return false;
		}
		var password = $("#login_passwd").val();
		if(!checkPasswd(password)){
			alert("enter your password");
			return false;
		}
		var now = new Date();
		localStorage.setItem("session",sm3(now.getTime().toString()));
		refresh();
		var button = $(this).parent();
		button.attr("disabled","disabled");
		user.login(address,email,sm3(password),session,{gas:500000}).then(function(res){
			waitForTx(res.transactionHash,function(){
				user.query(session,address).then(function(res){
					if(res == true){
						alert("login success");
						$("#vault").removeClass("iron-selected");
						$("#home").addClass("iron-selected");
						user.users(address).then(function(info){
							var paper = info[0];
							if(paper == "0x0000000000000000000000000000000000000000"){
								PaperCopyright.deploy([address],{gas:4700000}).then(function(res){
									contractOfPaper = res;
									user.setPaperAddr(session,address,contractOfPaper.address,{gas:500000}).then(function(res){
										waitForTx(res.transactionHash,function(){
											// do nothing
										});
									});
								});
							}else{
								contractOfPaper = new EmbarkJS.Contract({abi: PaperCopyright.abi, address: paper});
								getPaperList();
							}
							userInfo.wallet = info[2].toNumber();
							userInfo.username = info[3];
							userInfo.email = info[4];
							var avatar = info[5];
							if(avatar != ""){
								userInfo.hash = avatar;
								userInfo.avatar = EmbarkJS.Storage.getUrl(avatar);
							}
							userInfo.bio = info[6];
							userInfo.location = info[7];
							user.txNum(session,address).then(function(res){
								userInfo.sell = res.toNumber();
								if(userInfo.sell > 0){
									user.txList(address).then(function(res){
										userInfo.txInfo = res[userInfo.sell-1];
										console.log(userInfo.txInfo);
									});
								}
							});
						});
					}else{
						alert("login false");
					}
					button.removeAttr("disabled");
				});
			});
		});
	});
	/* position:home页面
	 * event:跳转个人信息页
	 */
	$(document).on("click","#homeJumpToProfile",function(){
		$("#home").removeClass("iron-selected");
		$("#profile").addClass("iron-selected");
	});
	/* position:个人信息页
	 * event:退出登录跳转首页
	 */
	$(document).on("click","#logout",function(){
		user.logout(session,address).then(function(res){
			// no waitForTx
			$("#profile").removeClass("iron-selected");
			$("#intro").addClass("iron-selected");
			slidePage("blackcolor",true,"yellowback","vaultPage","welcome","none","blueback");
		});
	});
	/* position:个人信息页
	 * event:点击叉叉返回home页
	 */
	$(document).on("click","#profile .topbar iron-icon:eq(0)",function(){
		$("#profile").removeClass("iron-selected");
		$("#home").addClass("iron-selected");
	});
	/* position:个人信息页
	 * event:点击上传头像
	 */
	$(document).on("click","#uploadbtn",function(){
		$("#avatarupload").click();
	});
	/* position:个人信息页
	 * event:选择图片并上传
	 */
	$(document).on("change","#avatarupload",function(){
		var url = $("#avatarupload");
		if(url.val() != ""){
          	EmbarkJS.Storage.uploadFile(url).then(function(hash) {
              var ipfsUrl = EmbarkJS.Storage.getUrl(hash);
              userInfo.avatar = ipfsUrl;
              userInfo.hash = hash;
              avalon.scan();
              editMyInfo();
            });
		}
	});
	/* position:个人信息页
	 * event:修改个人信息
	 */
	$(document).on("click","#editInfo",function(){
		editMyInfo();
	});
	/* position:个人信息页
	 * event:删除账户
	 */
	$(document).on("click","#deletemyvault",function(){
		user.deleteAccount(session,address).then(function(res){
			localStorage.removeItem("uid");
			localStorage.removeItem("session");
			refresh();
			$("#profile").removeClass("iron-selected");
			$("#intro").addClass("iron-selected");
			slidePage("blackcolor",true,"yellowback","vaultPage","welcome","none","blueback");
		});
	});
	/* position:个人信息页
	 * event:修改密码
	 */
	$(document).on("click","#modifyPasswd",function(){
		var oldPasswd = $("#profile_old_passwd").val();
		if(!checkPasswd(oldPasswd)){
			alert("old password error!");
			return false;
		}
		var newPasswd = $("#profile_new_passwd").val();
		var repeatPasswd = $("#profile_repeat_passwd").val();
		if(!checkPasswd(newPasswd,repeatPasswd)){
			alert("new password error!");
			return false;
		}
		user.modifyPasswd(session,address,sm3(oldPasswd),sm3(newPasswd)).then(function(res){
			// no waitForTx
			$("#profile").removeClass("iron-selected");
			$("#vault").addClass("iron-selected");
			$("#profile_old_passwd").val("");
			$("#profile_new_passwd").val("");
			$("#profile_repeat_passwd").val("");
			slidePage("blackcolor",false,"blueback","vaultPage","unlock","block");
		});
	});
	/* position:注册前须知页面
	 * event:跳转注册页面
	 */
	$(document).on("click","#nope",function(){
		$("#vault").addClass("iron-selected");
		$("#intro").removeClass("iron-selected");
		slidePage(false,false,false,"createwalletpgs","createnew");
	});
	/* position:注册页面
	 * event:返回首页
	 */
	$(document).on("click","#createnew iron-icon:eq(0)",function(){
		$("#vault").removeClass("iron-selected");
		$("#intro").addClass("iron-selected");
		slidePage("blackcolor",true,"yellowback","vaultPage","welcome","none","blueback");
	});
	/* position:注册页面
	 * event:跳转登录页
	 */
	$(document).on("click","#createnew iron-icon:eq(1)",function(){
		var email = $("#register_email").val();
		if(!checkEmail(email)){
			alert("enter your email!");
			return false;
		}
		var name = $("#register_name").val();
		if(!checkName(name)){
			alert("enter your name!");
			return false;
		}
		var firstPasswd = $("#register_passwd").val();
		var secondPasswd = $("#register_repeat_passwd").val();
		if(!checkPasswd(firstPasswd,secondPasswd)){
			alert("password must be the same!");
			return false;
		}
		generateUid();
		$("#createnew ac-password:eq(0)").css("display","none");
		$("#createnew .loaderinit:eq(0)").html($("#loader_container").html());
		user.register(address,sm3(firstPasswd),name,email,{gas:500000}).then(function(res){
			waitForTx(res.transactionHash,function(){
				user.users(address).then(function(res){
					if(res[3] == ""){
						alert("register false");
						console.log(address);
						localStorage.removeItem("uid");
						refresh();
					}else{
						alert("register success");
						slidePage("blackcolor",false,"blueback","vaultPage","unlock","block");
					}
					$("#createnew .loaderinit:eq(0)").html("");
					$("#createnew ac-password:eq(0)").css("display","block");
				});
			});
		});
	});
	/* position:home页面
	 * event:跳转到充值页面
	 */
	$(document).on("click","#homebalance",function(){
		$("#home").removeClass("iron-selected");
		$("#walletview").addClass("iron-selected");
	});
	/* position:充值页面
	 * event:返回home页面
	 */
	$(document).on("click","#walletview iron-icon:eq(0)",function(){
		$("#walletview").removeClass("iron-selected");
		$("#home").addClass("iron-selected");
	});
	/* position:充值页面
	 * event:充值
	 */
	$(document).on("click","#addcoin",function(){
		var coin = parseInt($("#coin_input").val());
		if(coin == NaN || coin <= 0) return false;
		$("#addcoin").attr("disabled","disabled");
		user.recharge(session,address,coin).then(function(res){
			waitForTx(res.transactionHash,function(){
				user.users(address).then(function(res){
					userInfo.wallet = res[2];
					avalon.scan();
					$("#addcoin").removeAttr("disabled");
					$("#walletview").removeClass("iron-selected");
					$("#home").addClass("iron-selected");
				});
			});
		});
	});
	/* position:home页面
	 * event:跳转到声明版权页面
	 */
	$(document).on("click","#declarecopyright",function(){
		$("#home").removeClass("iron-selected");
		$("#vault").addClass("iron-selected");
		slidePage("blackcolor",false,"yellowback","vaultPage","importpk","block");
	});
	/* position:声明版权页面
	 * event:返回home
	 */
	$(document).on("click","#importpk iron-icon:eq(0)",function(){
		$("#vault").removeClass("iron-selected");
		$("#importpk").removeClass("iron-selected");
		$("#home").addClass("iron-selected");
	});
	/* position:声明版权页面
	 * event:跳转到上传论文页面
	 */
	$(document).on("click","#importpk iron-icon:eq(2)",function(){
		var title = $("#privatekeyinput input:eq(0)").val();
		if(title == "") return false;
		slidePage(false,false,false,"vaultPage","importfile");
	});
	/* position:上传论文页面
	 * event:上传到IPFS
	 */
	$(document).on("click","#uploadpaper",function(){
		$("#paperupload").click();
	});
	/* position:上传论文页面
	 * event:上传到IPFS
	 */
	$(document).on("change","#paperupload",function(){
		var url = $("#paperupload");
		if(url.val() != ""){
          	EmbarkJS.Storage.uploadFile(url).then(function(hash) {
              contractOfPaper.addPaper(address,userInfo.username,hash,$("#privatekeyinput input:eq(0)").val(),true,{gas:500000}).then(function(res){
              	waitForTx(res.transactionHash,function(){
              		getPaperList();
              		url.val("");
              		$("#privatekeyinput input:eq(0)").val("");
              		$("#vault").removeClass("iron-selected");
              		$("#importfile").removeClass("iron-selected");
              		$("#home").addClass("iron-selected");
              	});
              });
            });
		}
	});
	/* position:unknow
	 */
	$(document).on("click","#asJsonFile",function(){
		$("#vault").addClass("iron-selected");
		$("#intro").removeClass("iron-selected");
		slidePage(false,false,false,"createwalletpgs","importfile");
	});
	/* position:unknow
	 * event:返回首页
	 */
	$(document).on("click","#importfile iron-icon:eq(0)",function(){
		$("#vault").removeClass("iron-selected");
		$("#importfile").removeClass("iron-selected");
		$("#home").addClass("iron-selected");
	});
	/* position:unknow
	 */
	$(document).on("click","#backupFile",function(){
		$("#vault").addClass("iron-selected");
		$("#intro").removeClass("iron-selected");
		slidePage(false,false,false,"createwalletpgs","importipfs");
	});
	/* position:unknow
	 * event:返回首页
	 */
	$(document).on("click","#importipfs iron-icon:eq(0)",function(){
		$("#vault").removeClass("iron-selected");
		$("#intro").addClass("iron-selected");
		slidePage("blackcolor",true,"yellowback","vaultPage","welcome","none","blueback");
	});
	/* position:unknow
	 */
	$(document).on("click","#asPdf",function(){
		$("#vault").addClass("iron-selected");
		$("#intro").removeClass("iron-selected");
		slidePage(false,false,false,"createwalletpgs","importpk");
	});
	/* position:unknow
	 */
	$(document).on("click","#externalwallet",function(){
		$("#vault").addClass("iron-selected");
		$("#intro").removeClass("iron-selected");
		slidePage(false,false,false,"createwalletpgs","importethwallet");
	});
	/* position:unknow
	 * event:返回首页
	 */
	$(document).on("click","#importethwallet iron-icon:eq(0)",function(){
		$("#vault").removeClass("iron-selected");
		$("#intro").addClass("iron-selected");
		slidePage("blackcolor",true,"yellowback","vaultPage","welcome","none","blueback");
	});
});

function refresh() {
	address = localStorage.getItem("uid");
	session = localStorage.getItem("session");
}

function slidePage(topbar,addOrRemove,classHere,pageId,showId,icon,backname) {
	if(topbar){
		if(addOrRemove){
			$("#"+topbar).addClass(classHere);
			if(backname)
				$("#"+topbar).removeClass(backname);
		}else{
			$("#"+topbar).removeClass(classHere);
		}
		$("#icon").css("display",icon);
	}
	var hideElement = $("#"+pageId+" .iron-selected:eq(0)");
	hideElement.removeClass("iron-selected").addClass("neon-animating");
	$("#"+showId).css({"left":"100%","right":"-100%"}).addClass("iron-selected neon-animating");
	hideElement.animate({left:"-100%",right:"100%"},300,"linear",function(){
		$(this).removeClass("neon-animating");
	});
	$("#"+showId).animate({left:"0",right:"0"},300,"linear",function(){
		$(this).css({"left":0,"right":0}).removeClass("neon-animating");
	});
}

function checkEmail(email){
	var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
	if(email == "" || !reg.test(email))
		return false;
	else
		return true;
}

function checkName(name){
	if (name == "")
		return false;
	else
		return true;
}

function checkPasswd(first,second){
	if(arguments.length == 1){
		if(first == "" || first.length < 5)
			return false;
		else
			return true;
	}else if(arguments.length == 2){
		if(first == "" || first.length < 5 || first != second)
			return false;
		else
			return true;
	}
}

function generateUid(){
	var chars = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
	var res = "";
	for(var i = 0; i < 40 ; i ++) {
	    var id = Math.ceil(Math.random()*15);
	    res += chars[id];
	}
	localStorage.setItem("uid",'0x' + res);
	refresh();
}

function waitForTx(res,func){
	var tx = setInterval(function(){
		var currentBlock = web3.eth.blockNumber;
        var txBlock = web3.eth.getTransaction(res).blockNumber;
        if(txBlock != null && currentBlock > txBlock){
            clearInterval(tx);
            func();
		}
	},1000);
}

function editMyInfo(){
	user.editMyInfo(session,address,$("#profile_email").val(),userInfo.hash,$("#profile_bio").val(),$("#profile_location").val(),{gas:500000}).then(function(res){
	    waitForTx(res.transactionHash,function(){
	    	// do nothing
	    });
	});
}

function getPaperList(){
	contractOfPaper.len().then(function(res){
		var paperLength = res.toNumber();
		if(paperLength > 0){
			userInfo.len = paperLength;
			userInfo.paper = [];
			for(var i = 0;i < paperLength;i++){
				contractOfPaper.getAllPaperInfo(address,i).then(function(res){
					userInfo.paper.push({
						"hash":res[1],
						"title":res[2],
						"date":res[3]
					});
				});
			}
			avalon.scan();
		}
	});
}