var address = localStorage.getItem("uid");
$(function(){
	$(document).on("click","#yellow",function(){
		if(address == null)
			slidePage("blackcolor",false,"yellowback","createwalletpgs","newuser","block");
		else
			slidePage("blackcolor",false,"yellowback","createwalletpgs","first","block");
	});

	$(document).on("click","#icon",function(){
		slidePage("blackcolor",true,"yellowback","createwalletpgs","welcome","none","blueback");
	});

	$(document).on("click","#createNewUser",function(){
		slidePage("blackcolor",true,"blueback","createwalletpgs","first","block");
	});

	$(document).on("click","#convertToken",function(){
		//slidePage("blackcolor",false,"blueback","createwalletpgs","importwallet","block");
		slidePage("blackcolor",true,"yellowback","createwalletpgs","welcome","none","blueback");
	});

	$(document).on("click","#restoreJumpToLogin,#createnew iron-icon:eq(1)",function(){
		slidePage("blackcolor",false,"blueback","vaultPage","unlock","block");
	});

	$(document).on("click","#unlock iron-icon:eq(0)",function(){
		$("#vault").removeClass("iron-selected");
		$("#intro").addClass("iron-selected");
		slidePage("blackcolor",true,"yellowback","vaultPage","welcome","none","blueback");
	});

	$(document).on("click","#unlock iron-icon:eq(1)",function(){
		$("#vault").removeClass("iron-selected");
		$("#home").addClass("iron-selected");
	});

	$(document).on("click","#homeJumpToProfile",function(){
		$("#home").removeClass("iron-selected");
		$("#profile").addClass("iron-selected");
	});

	$(document).on("click","#profile .topbar iron-icon:eq(0)",function(){
		$("#profile").removeClass("iron-selected");
		$("#home").addClass("iron-selected");
	});

	$(document).on("click","#asJsonFile",function(){
		$("#vault").addClass("iron-selected");
		$("#intro").removeClass("iron-selected");
		slidePage(false,false,false,"createwalletpgs","importfile");
	});

	$(document).on("click","#importfile iron-icon:eq(0)",function(){
		$("#vault").removeClass("iron-selected");
		$("#intro").addClass("iron-selected");
		slidePage("blackcolor",true,"yellowback","vaultPage","welcome","none","blueback");
	});

	$(document).on("click","#backupFile",function(){
		$("#vault").addClass("iron-selected");
		$("#intro").removeClass("iron-selected");
		slidePage(false,false,false,"createwalletpgs","importipfs");
	});

	$(document).on("click","#importipfs iron-icon:eq(0)",function(){
		$("#vault").removeClass("iron-selected");
		$("#intro").addClass("iron-selected");
		slidePage("blackcolor",true,"yellowback","vaultPage","welcome","none","blueback");
	});

	$(document).on("click","#nope",function(){
		$("#vault").addClass("iron-selected");
		$("#intro").removeClass("iron-selected");
		slidePage(false,false,false,"createwalletpgs","createnew");
	});

	$(document).on("click","#createnew iron-icon:eq(0)",function(){
		$("#vault").removeClass("iron-selected");
		$("#intro").addClass("iron-selected");
		slidePage("blackcolor",true,"yellowback","vaultPage","welcome","none","blueback");
	});

	$(document).on("click","#asPdf",function(){
		$("#vault").addClass("iron-selected");
		$("#intro").removeClass("iron-selected");
		slidePage(false,false,false,"createwalletpgs","importpk");
	});

	$(document).on("click","#importpk iron-icon:eq(0)",function(){
		$("#vault").removeClass("iron-selected");
		$("#intro").addClass("iron-selected");
		slidePage("blackcolor",true,"yellowback","vaultPage","welcome","none","blueback");
	});

	$(document).on("click","#externalwallet",function(){
		$("#vault").addClass("iron-selected");
		$("#intro").removeClass("iron-selected");
		slidePage(false,false,false,"createwalletpgs","importethwallet");
	});

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