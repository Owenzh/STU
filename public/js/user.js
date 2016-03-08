$(document).ready(function () {
    var user_id = $.cookie('stu_user_id');
    var user_name = $.cookie('stu_user_name');
    var user_role = $.cookie('stu_user_role');
    var user_role_label = $.cookie('stu_user_role_label');
    $("#user_name").text(user_name);
    $("#user_role").text(user_role_label);
    //hide for comment
    $("#ipt_user_id").val($.cookie('stu_user_id'));
    $("#ipt_user_name").val($.cookie('stu_user_name'));
    //hide for comment
    /*
     * post_list_section
     *
     * post_detail_section
     * add_comment_section
     * */
    $("#post_list_section").show();
    $("#post_detail_section").hide();
    $("#add_comment_section").hide();

    function queryPost() {
        $("#post_list_section").show();
        $("#post_detail_section").hide();
        $("#add_comment_section").hide();
        function handSuccess(data, textStatus, jqXHR) {
            var dataRes = data;
            var postArr = data.data;
            var list_html = $("#post_list_content");
            var htmlStr = '';
            $("#p_counts").text(dataRes.count);
            if (dataRes.count > 0) {
                var tr = '';
                var trArr = [];
                for (var i = 0; postArr[i]; i++) {
                    tr = '<tr class="tie_row">';
                    tr += '<td><span class="badge">' + (postArr[i]["p_comment_count"] ? postArr[i]["p_comment_count"] : "0") + '</span></td>';
                    tr += '<td><a href="#" id="' + postArr[i]["p_id"] + '" onclick="showPostDetail(this);">';
                    tr += postArr[i]["p_title"] + '</a></td>';
                    tr += '<td><span class="text-center">' + postArr[i]["p_creator"] + '</span></td>';
                    tr += '<td><span class="small text-muted pull-right">' + String(postArr[i]["p_date"]).substr(0, 10) + '</span></td></tr>';
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
    $("#send_comment").bind("click", sendComment);
    queryPost();
});
function commonErrorHandler() {
    alert("操作失败");
}
function showPostDetail(aTag) {
    //alert(aTag.id);
    $.ajax({
        type: 'get',
        url: '/doPostDetail?p_id=' + aTag.id,
        success: renderPostDetail,
        error: commonErrorHandler
    });
    function renderPostDetail(data, textStatus, jqXHR) {
        $("#post_detail_section").show();
        $("#add_comment_section").show();
        $("#post_list_section").hide();
        $("#add_post_section").hide();
        //console.log(data);
        var postData = data.p_data;
        var commentData = data.c_data;
        var commentCount = data.c_count;
        var postBody = $("#post_detail_body");
        postBody.html("");
        var postTRArr = [];
        $("#post_header").text(postData[0]["p_title"]);
        if (commentCount > 0) {

            for (var i = 0; i < commentCount; i++) {
                var tr = "";
                tr += '<tr class="comment_row">';
                tr += '<td><img src="/imgs/male.png" class="comment_photo img-circle"> <span class="small text-muted">' + commentData[i]["c_creator"] + '</span></td>';
                tr += '<td>' + commentData[i]["c_content"] + '</td>';
                tr += '<td><span class="small text-muted pull-right">' + String(commentData[i]["c_date"]).substr(0, 10) + '</span></td>';
                tr += '</tr>';
                postTRArr.push(tr);
            }
            postTRArr.push('<tr><td colspan="3"></td></tr>');
        } else {
            postTRArr.push('<tr><td colspan="3">未找到数据！</td></tr>');
        }

        postBody.html(postTRArr.join(""));

        $("#ipt_p_id").val(postData[0]["p_id"]);//hide for comment
        //console.log(document.getElementById("ipt_p_id").value);
    }
}

function sendComment() {
    //TODO
    var content = $("#ipt_c_content").val();
    var user_id = $("#ipt_user_id").val();
    var user_name = $("#ipt_user_name").val();
    var p_id = $("#ipt_p_id").val();
    var commentData = {
        p_id: p_id,
        c_content: content,
        c_creator_id: user_id,
        c_creator: user_name
    };
    $.ajax({
        type: 'post',
        url: '/doAddComment',
        data: commentData,
        success: function () {
            $("#ipt_c_content").val("");
            $("#" + p_id).click();
        },
        error: commonErrorHandler
    });
}