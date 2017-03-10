var address = localStorage.getItem("uid");
$(function(){
	/* position:首页
	 * event:跳转
	 * branch 0:无address，跳转注册/恢复addr
	 * branch 1:有address，跳转登录
	 */
	$(document).on("click","#yellow",function(){
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
		//slidePage("blackcolor",false,"blueback","createwalletpgs","importwallet","block");
		slidePage("blackcolor",true,"yellowback","createwalletpgs","welcome","none","blueback");
	});
	/* position:恢复address页面
	 * event:跳转登录页
	 */
	$(document).on("click","#restoreJumpToLogin,#createnew iron-icon:eq(1)",function(){
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
		$("#vault").removeClass("iron-selected");
		$("#home").addClass("iron-selected");
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
		$("#profile").removeClass("iron-selected");
		$("#intro").addClass("iron-selected");
		slidePage("blackcolor",true,"yellowback","vaultPage","welcome","none","blueback");
	});
	/* position:个人信息页
	 * event:点击叉叉返回home页
	 */
	$(document).on("click","#profile .topbar iron-icon:eq(0)",function(){
		$("#profile").removeClass("iron-selected");
		$("#home").addClass("iron-selected");
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
		$("#intro").addClass("iron-selected");
		slidePage("blackcolor",true,"yellowback","vaultPage","welcome","none","blueback");
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
	 * event:返回首页
	 */
	$(document).on("click","#importpk iron-icon:eq(0)",function(){
		$("#vault").removeClass("iron-selected");
		$("#intro").addClass("iron-selected");
		slidePage("blackcolor",true,"yellowback","vaultPage","welcome","none","blueback");
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