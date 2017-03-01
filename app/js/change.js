/**
 * Created by 李悦 on 2017/2/28.
 */
$(function () {
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
    })
});

