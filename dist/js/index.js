address = null;
session = null;
refresh();
contractOfPaper = null;
guestPaper = null;
destIP = "192.168.1.100"; // server ip
EmbarkJS.Storage.setProvider('ipfs',{server: destIP, port: '5001'});

var userInfo = avalon.define({
	$id:"userInfo",
	paper:[],
	wallet:"",
	username:"username",
	email:"",
	hash:"",
	phone:"",
	avatar:"img/unnamed.jpg",
	bio:"",
	location:"",
	address:address,
	len:0,
	sell:0,
	txInfo:{},
	singlePaper:{}
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
			user.query(session,address).then(function(res){
				console.log(res);
				if(res == true){
					enterHomePage();
					$("#intro").removeClass("iron-selected");
					$("#home").addClass("iron-selected");
				}else{
					$("#intro").removeClass("iron-selected");
					$("#vault").addClass("iron-selected");	
					slidePage("blackcolor",false,"yellowback","createwalletpgs","unlock","block");
				}
			});
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
		var addr = $("#restore_input").val();
		if(!checkAddr(addr)){
			alert("address is not correct!");
			return false;
		}
		localStorage.setItem("uid",addr);
		refresh();
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
	$(document).on("click","#getcode",function(){
		var button = $(this);
		var phone = $("#login_phone").val();
		if(!checkPhone(phone)){
			alert("enter your phone");
			return false;
		}
		button.attr("disabled","disabled");
		// call message API
		$.ajax({
			url: "http://" + destIP + ":8000/sendMsg/" + phone + "/",
			cache: false,
			contentType: "application/json",
			dataType: "json",
			error: function(e){
				alert("获取失败，请重试");
			},
			success: function(data){
				console.log(data);
				alert(data.Message);
			},
			complete: function(){
				var times = 59;
				var a = setInterval(function(){
					button.text(times+"s后可重新获取");
					times -= 1;
					if(times == 0){
						clearInterval(a);
						button.text("获取验证码");
						button.removeAttr("disabled");
					}
				},1000);
			}
		});
	});
	$(document).on("click","#unlock iron-icon:eq(1)",function(){
		var phone = $("#login_phone").val();
		if(!checkPhone(phone)){
			alert("enter your phone");
			return false;
		}
		var password = $("#login_passwd").val();
		if(!checkPasswd(password)){
			alert("enter your password");
			return false;
		}
		var code = $("#message-verify").val();
		var verification = true;
		$.ajax({
			url: "http://" + destIP + ":8000/verify/" + phone + "/" + code + "/",
			cache: false,
			async:false,
			contentType: "application/json",
			dataType: "json",
			error: function(e){
				alert("验证码错误");
				verification = false;
			},
			success: function(data){
				if(data.result == false){
					alert("验证码错误");
					verification = false;
				}
			}
		});
		if(verification == false) return false;
		var now = new Date();
		localStorage.setItem("session",sm3(now.getTime().toString()));
		refresh();
		var button = $(this).parent();
		button.attr("disabled","disabled");
		user.login(address,phone,sm3(password),session,{gas:500000}).then(function(res){
			user.query(session,address).then(function(res){
				if(res == true){
					alert("登录成功!");
					$("#vault").removeClass("iron-selected");
					$("#home").addClass("iron-selected");
					// load info
					enterHomePage();
				}else{
					alert("登录失败!");
				}
				button.removeAttr("disabled");
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
			$("#profile").removeClass("iron-selected");
			$("#intro").addClass("iron-selected");
			slidePage("blackcolor",true,"yellowback","vaultPage","welcome","none","blueback");
		});
	});
	/* position:个人信息页
	 * event:点击叉叉返回home页
	 */
	$(document).on("click","#profile .topbar iron-icon:eq(0)",function(){
		enterHomePage();
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
              var ipfsUrl = EmbarkJS.Storage.getUrl(destIP,hash);
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
		var phone = $("#register_phone").val();
		if(!checkPhone(phone)){
			alert("enter your phone!");
			return false;
		}
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
		user.register(address,sm3(firstPasswd),name,email,phone,{gas:500000}).then(function(res){
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
			user.users(address).then(function(res){
				userInfo.wallet = res[1];
				avalon.scan();
				$("#coin_input").val("");
				$("#addcoin").removeAttr("disabled");
				$("#walletview").removeClass("iron-selected");
				$("#home").addClass("iron-selected");
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
	$(document).on("click","#importpk iron-icon:eq(1)",function(){
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
		$("#uploadpaper").hide();
		var insert = document.createElement("div");
		$(insert).attr("id","temp_load").html($("#loader_container").html());
		url.after($(insert));
		if(url.val() != ""){
			var papertitle = $("#privatekeyinput input:eq(0)").val();
          	EmbarkJS.Storage.uploadFile(url).then(function(hash) {
          		// call paperdetect API
          		alert("正在进行盗版检测，请稍候...");
				$.ajax({
					url: "http://" + destIP + ":8000/paperdetect/" + hash + "/",
					cache: false,
					async: false,
					contentType: "application/json",
					dataType: "json",
					error: function(e){
						alert("盗版检测暂时不能提供服务...");
						getPaperList();
		          		url.val("");
		          		alert("论文版权申明成功！");
		          		$("#temp_load").remove();
		          		$("#uploadpaper").show();
						document.getElementById("isPublic").checked = false;
		          		$("#privatekeyinput input:eq(0)").val("");
		          		$("#vault").removeClass("iron-selected");
		          		$("#importfile").removeClass("iron-selected");
		          		$("#home").addClass("iron-selected");
					},
					success: function(data){
						var similar = data.similarity;
						if(similar >= 0.8){
							alert("您申明的论文《"+papertitle+"》涉及版权问题，检测相似度为"+similar+",不予以申明!");
							getPaperList();
			          		url.val("");
			          		$("#temp_load").remove();
			          		$("#uploadpaper").show();
							document.getElementById("isPublic").checked = false;
			          		$("#privatekeyinput input:eq(0)").val("");
			          		$("#vault").removeClass("iron-selected");
			          		$("#importfile").removeClass("iron-selected");
			          		$("#home").addClass("iron-selected");
						}else{
							contractOfPaper.addPaper(address,userInfo.username,hash,papertitle,$("#isPublic").is(":checked"),{gas:500000}).then(function(res){
				          		getPaperList();
				          		url.val("");
				          		alert("论文版权申明成功！");
				          		$("#temp_load").remove();
				          		$("#uploadpaper").show();
								document.getElementById("isPublic").checked = false;
				          		$("#privatekeyinput input:eq(0)").val("");
				          		$("#vault").removeClass("iron-selected");
				          		$("#importfile").removeClass("iron-selected");
				          		$("#home").addClass("iron-selected");
				          	});
						}
					}
				});	
            });
		}
	});
	/* position:welcome主页
	 * event:游客页面
	 */
	$(document).on("click","#guest_addr",function(){
		var addr = $("#input_guest").val();
		if(!checkAddr(addr)){
			alert("addr is not correct!");
			return false;
		}
		user.users(addr).then(function(res){
			if(res[0] == '0x0000000000000000000000000000000000000000'){
				alert("not found such person!");
				return false;
			}else{
				guestPaper = new EmbarkJS.Contract({abi: PaperCopyright.abi, address: res[0]});
				guestPaper.len().then(function(res){
					var paperLength = res.toNumber();
					if(paperLength > 0){
						userInfo.len = paperLength;
						userInfo.paper = [];
						for(var i = 0;i < paperLength;i++){
							guestPaper.getPaperInfo(i).then(function(res){
								if(res[4].toNumber() == 0){
									userInfo.len --;
								}else{
									userInfo.paper.push({
										"index":res[5].toNumber(),
										"hash":res[1],
										"title":res[2],
										"date":transformTimestamp(res[3]),
										"blockNum":res[4].toNumber()
									});
								}
							});
						}
					}
				});
				userInfo.username = res[3];
				userInfo.address = addr;
				var avatar = res[6];
				if(avatar != ""){
					userInfo.hash = avatar;
					userInfo.avatar = EmbarkJS.Storage.getUrl(destIP,avatar);
				}else{
					userInfo.avatar = "img/unnamed.jpg";
				}
				userInfo.email = res[5];
				userInfo.bio = res[7];
				userInfo.location = res[8];
				avalon.scan();
				$("#intro").removeClass("iron-selected");
				$("#guest_home").addClass("iron-selected");
				$("#input_guest").val("");
				slidePage("blackcolor",false,"yellowback","createwalletpgs","guest_home","block");
			}
		});
	});
	/* position:guest page
	 * event:back to welcome
	 */
	$(document).on("click","#backtowelcome",function(){
		$("#guest_home").removeClass("iron-selected");
		$("#intro").addClass("iron-selected");
		slidePage("blackcolor",true,"yellowback","createwalletpgs","welcome","none");
	});
	/* position:home
	 * event:jump to owner paper page
	 */
	$(document).on("click",".ownerpaper",function(){
		userInfo.singlePaper = {};
		var index = $(this).attr("index");
		contractOfPaper.getAllPaperInfo(address,parseInt(index)).then(function(res){
			userInfo.singlePaper = {
				"index":index,
				"filehash":res[1],
				"title":res[2],
				"date":transformTimestamp(res[3]),
				"isPublic":res[4],
				"blockNum":res[5]
			};
			avalon.scan();
			$("#home").removeClass("iron-selected");
			$("#singlepaper").addClass("iron-selected");
		});
	});
	/* position:owner paper page
	 * event:back to home
	 */
	$(document).on("click","#singlepaper iron-icon:eq(0)",function(){
		getPaperList();
		$("#singlepaper").removeClass("iron-selected");
		$("#home").addClass("iron-selected");
	});
	/* position:owner paper page
	 * event:download paper
	 */
	$(document).on("click",".download-paper",function(){
		window.open(EmbarkJS.Storage.getUrl(destIP,userInfo.singlePaper.filehash));
	});
	/* position:owner paper page
	 * event:delete paper
	 */
	$(document).on("click","#deletethispaper",function(){
		contractOfPaper.deletePaper(address,userInfo.singlePaper.index,{gas:500000}).then(function(res){
			alert("deleted!");
			$("#singlepaper iron-icon:eq(0)").click();
		});
	})
	/* position:owner paper page
	 * event:makepublic
	 */
	$(document).on("click","#makepublic",function(){
		userInfo.singlePaper.isPublic = true;
		contractOfPaper.editPaper(address,userInfo.singlePaper.index,userInfo.username,userInfo.singlePaper.filehash,userInfo.singlePaper.title,true,{gas:500000}).then(function(res){
			getSinglePaper(userInfo.singlePaper.index);
		});
	});
	/* position:owner paper page
	 * event:makeprivate
	 */
	$(document).on("click","#makeprivate",function(){
		userInfo.singlePaper.isPublic = false;
		contractOfPaper.editPaper(address,userInfo.singlePaper.index,userInfo.username,userInfo.singlePaper.filehash,userInfo.singlePaper.title,false,{gas:500000}).then(function(res){
			getSinglePaper(userInfo.singlePaper.index);
		});
	});
	/* position:owner paper page
	 * event:re-upload paper
	 */
	$(document).on("click","#re-uploadbutton",function(){
		$("#re-uploadpaper").click();
	});
	/* position:owner paper page
	 * event:re-upload paper
	 */
	$(document).on("change","#re-uploadpaper",function(){
		var url = $("#re-uploadpaper");
		if(url.val() != ""){
          	EmbarkJS.Storage.uploadFile(url).then(function(hash) {
              userInfo.singlePaper.filehash = hash;
              contractOfPaper.editPaper(address,userInfo.singlePaper.index,userInfo.username,userInfo.singlePaper.filehash,userInfo.singlePaper.title,userInfo.singlePaper.isPublic,{gas:500000}).then(function(res){
			  	  url.val("");
				  getSinglePaper(userInfo.singlePaper.index);
			  });
              avalon.scan();
            });
		}
	});
	/* position:owner paper page || guest paper page
	 * event:show certification
	 */
	$(document).on("click",".certificate",function(){
		var blockNumber = parseInt(userInfo.singlePaper.blockNum);
		generateCert(userInfo.singlePaper.title,userInfo.username,userInfo.singlePaper.date,blockNumber,web3.eth.getBlock(blockNumber).transactions[0]);
	});
	/* position:owner paper page
	 * event:close cert
	 */
	$(document).on("click","#cert_container",function(){
		$(this).hide();
	});
	/* position:guest paper page
	 * event:back to guest home
	 */
	$(document).on("click","#guestsinglepaper iron-icon:eq(0)",function(){
		$("#guestsinglepaper").removeClass("iron-selected");
		$("#guest_home").addClass("iron-selected");
	});
	/* position:guest home
	 * event:jump to guest single paper
	 */
	$(document).on("click",".guestpaper",function(){
		userInfo.singlePaper = {};
		var index = $(this).attr("index");
		guestPaper.getPaperInfo(parseInt(index)).then(function(res){
			userInfo.singlePaper = {
				"index":index,
				"filehash":res[1],
				"title":res[2],
				"date":transformTimestamp(res[3]),
				"blockNum":res[4]
			};
			avalon.scan();
			$("#guest_home").removeClass("iron-selected");
			$("#guestsinglepaper").addClass("iron-selected");
		});
	});
	/* position:guest single paper
	 * event:sendTx
	 */
	$(document).on("click","#sendTx",function(){
		user.query(session,address).then(function(res){
			if(!res){
				alert("you must login first!");
				return false;
			}
			var price = parseInt($("#tx-price").val());
			if (price <= 0){
				alert("price must be positive number!");
				return false;
			}
			user.getMyInfo(session,address).then(function(info){
				if(parseInt(info[1]) < price){
					alert("wallet is not enough!");
					return false;
				}
				user.paperTx(session,address,userInfo.address,price,userInfo.singlePaper.index,userInfo.singlePaper.filehash,{gas:500000}).then(function(res){
					alert("tx have sent!");
					$("#tx-price").val("");
				});
			});
		});
	});
	/* position:profile page
	 * event:approve tx
	 */
	$(document).on("click","#approveTx",function(){
		user.doneTx(session,address,userInfo.sell-1,true,{gas:500000}).then(function(res){
			getSinglePaper(parseInt($("#approveTx").attr("index")));
			user.getOtherUserInfo(userInfo.txInfo.from).then(function(res){
				guestPaper = new EmbarkJS.Contract({abi: PaperCopyright.abi, address: res[0]});
				guestPaper.addPaper(userInfo.txInfo.from,userInfo.username,userInfo.singlePaper.filehash,userInfo.singlePaper.title,true,{gas:500000}).then(function(res){
						contractOfPaper.deletePaper(address,userInfo.txInfo.index,{gas:500000}).then(function(res){
							// do nothing
							alert("doneTx");
							userInfo.sell--;
							if(userInfo.sell > 0){
								user.getTx(session,address,userInfo.sell-1).then(function(res){
									userInfo.txInfo = {
										"from":res[0],
										"paper":res[1],
										"price":res[2],
										"date":transformTimestamp(res[3]),
										"index":parseInt(res[4])
									};
								});
							}else{
								userInfo.txInfo = {};
							}
							avalon.scan();
						});
				});
			});
		});
	});
	/* position:profile page
	 * event:refuse tx
	 */
	$(document).on("click","#refuseTx",function(){
		user.doneTx(session,address,userInfo.sell-1,false,{gas:500000}).then(function(res){
			userInfo.sell--;
			if(userInfo.sell > 0){
				user.getTx(session,address,userInfo.sell-1).then(function(res){
					userInfo.txInfo = {
						"from":res[0],
						"paper":res[1],
						"price":res[2],
						"date":transformTimestamp(res[3]),
						"index":parseInt(res[4])
					};
				});
			}else{
				userInfo.txInfo = {};
			}
			avalon.scan();
		});
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

function checkPhone(phone){
	var reg = /^1[3|4|5|7|8][0-9]{9}$/; //验证规则
	return reg.test(phone); //true
}

function checkAddr(addr){
	var reg = /^0x[0-9a-f]{40}$/;
	return reg.test(addr);
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

function editMyInfo(){
	user.editMyInfo(session,address,$("#profile_email").val(),userInfo.hash,$("#profile_bio").val(),$("#profile_location").val(),{gas:500000}).then(function(res){
	});
}

function getPaperList(){
	userInfo.paper = [];
	userInfo.len = 0;
	contractOfPaper.len().then(function(res){
		var paperLength = res.toNumber();
		if(paperLength > 0){
			userInfo.len = paperLength;
			for(var i = 0;i < paperLength;i++){
				contractOfPaper.getAllPaperInfo(address,i).then(function(res){
					userInfo.paper.push({
						"index":res[6].toNumber(),
						"hash":res[1],
						"title":res[2],
						"date":transformTimestamp(res[3]),
						"isPublic":res[4],
						"blockNum":res[5].toNumber()
					});
				});
			}
			avalon.scan();
		}
	});
}

function transformTimestamp(date){
	var timestamp = parseInt(date + "000");
	var transform = new Date(timestamp);
	return transform.getFullYear().toString() + "/" + (transform.getMonth() + 1).toString() + "/" + transform.getDate().toString() + " " + transform.getHours().toString() + ":" + transform.getMinutes().toString();
}

function enterHomePage(){
	user.users(address).then(function(info){
		var paper = info[0];
		if(paper == "0x0000000000000000000000000000000000000000"){
			PaperCopyright.deploy([address],{gas:4700000}).then(function(res){
				contractOfPaper = res;
				user.setPaperAddr(session,address,contractOfPaper.address,{gas:500000}).then(function(res){
				});
			});
			userInfo.paper = [];
			userInfo.len = 0;
		}else{
			contractOfPaper = new EmbarkJS.Contract({abi: PaperCopyright.abi, address: paper});
			getPaperList();
		}
		userInfo.sell = info[2].toNumber();
		userInfo.address = address;
		if(userInfo.sell > 0){
			user.getTx(session,address,userInfo.sell-1).then(function(res){
				userInfo.txInfo = {
					"from":res[0],
					"paper":res[1],
					"price":res[2],
					"date":transformTimestamp(res[3]),
					"index":parseInt(res[4])
				};
				avalon.scan();
			});
		}else{
			userInfo.txInfo = {};
		}
		userInfo.wallet = info[1].toNumber();
		userInfo.username = info[3];
		userInfo.phone = info[4];
		userInfo.email = info[5];
		var avatar = info[6];
		if(avatar != ""){
			userInfo.hash = avatar;
			userInfo.avatar = EmbarkJS.Storage.getUrl(destIP,avatar);
		}else{
			userInfo.avatar = "img/unnamed.jpg";
		}
		userInfo.bio = info[7];
		userInfo.location = info[8];
		avalon.scan();
	});
}

function getSinglePaper(index){
	userInfo.singlePaper = {};
	contractOfPaper.getAllPaperInfo(address,index).then(function(res){
		userInfo.singlePaper = {
			"index":index,
			"filehash":res[1],
			"title":res[2],
			"date":transformTimestamp(res[3]),
			"isPublic":res[4],
			"blockNum":res[5]
		};
		avalon.scan();
	});
}