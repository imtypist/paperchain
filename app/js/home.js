/**
 * Created by 李悦 on 2017/2/28.
 */
$(function () {
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
        window.location.href="change.html";
    });
});
