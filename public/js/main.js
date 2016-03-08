$(document).ready(function () {
    var user_id = $.cookie('stu_user_id');
    var user_name = $.cookie('stu_user_name');
    var user_role = $.cookie('stu_user_role');
    var user_role_label = $.cookie('stu_user_role_label');
    $("#user_name").text(user_name);
    $("#user_role").text(user_role_label);
    $("#post_section").hide();
    if(user_role=="user"){
        $("#fun_list").show();
    }
    $("#send_post").bind("click", function () {
        $("#post_list").hide();
        $("#post_section").show();
    });
    function commonErrorHandler() {
        alert("操作失败");
    }

    $("#add_post").bind("click", function () {
        var title = $("#ipt_p_title").val();
        var desc = $("#ipt_p_desc").val();
        var postData = {
            p_title: title,
            p_desc: desc,
            p_creator_id: user_id,
            p_creator: user_name
        };

        function success(data, textStatus, jqXHR) {
            $("#ipt_p_title").val("");
            $("#ipt_p_desc").val("");

            queryPost();
            $("#post_list").show();
            $("#post_section").hide();

        }

        $.ajax({
            type: 'post',
            url: '/doAddPost',
            data: postData,
            success: success,
            error: commonErrorHandler
        });
    });
    function queryPost() {
        $("#post_list").show();
        $("#post_section").hide();
        function handSuccess(data, textStatus, jqXHR) {
            var dataRes = data;
            var postArr = data.data;
            var list_html = $("#post_list_section");
            var htmlStr = '';
            $("#p_counts").text(dataRes.count);
            if (dataRes.count > 0) {
                var tr = '';
                var trArr = [];
                for (var i = 0; postArr[i]; i++) {
                    tr = '<tr class="tie_row">';
                    tr += '<td><span class="badge">' + (postArr[i]["p_comment_count"] ? postArr[i]["p_comment_count"] : "0") + '</span></td>';
                    tr += '<td><a href="/doPostDetail?p_id=' + postArr[i]["p_id"] + '">';
                    tr += postArr[i]["p_title"] + '</a></td>';
                    tr += '<td><span class="text-center">' + postArr[i]["p_creator"] + '</span>';
                    tr += '<span class="small text-muted pull-right">' + String(postArr[i]["p_date"]).substr(0, 10) + '</span></td>';
                    trArr.push(tr);
                }
                htmlStr = trArr.join("");
            } else {
                htmlStr = "未找到数据";
            }
            list_html.html(htmlStr);

            console.log(data);

        }

        $.ajax({
            type: 'get',
            url: '/doQueryPosts',
            success: handSuccess,
            error: commonErrorHandler
        });
    }

    $("#query_post").bind("click", queryPost);
    queryPost();
});