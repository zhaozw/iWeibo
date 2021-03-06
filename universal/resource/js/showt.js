// 全局事件
$(function () {
    var createSkinSelector = function () {
        var boxId;
        var skinId = "myskin" + new Date().getTime()+""; // 避免与页面静态CSS链接重复
        var boxWidth = 590;
        var boxHeight = 200;
        var boxLeft = ($("body").width() - boxWidth) / 2;
        var boxTop = (document.documentElement.scrollTop || document.body.scrollTop) + 0.618 * (document.documentElement.clientHeight - boxHeight) / 2;
        boxId = IWB_DIALOG._init({
            modal: false
           ,showClose: true
           ,onClose:function() { 
           	   $("link[id=" + skinId + "]").remove();
           }
           ,width: boxWidth
           ,height: boxHeight
           ,top: boxTop
           ,left: boxLeft
           ,getDOM: function () {
                var skinSelector = ["<div class=\"facesettingBox\" style=\"border:none;position:relative;top:-10px;height:210px;\">"
                              ,"    <div class=\"tit\">"
                              ,"        <span class=\"facesetting\"></span>"
                              ,"        <strong>皮肤设置</strong>"
                              ,"    </div>"
                              ,"    "
                              ,"    <div class=\"facelist\">"
                              ,"        <ul class=\"DtempList clear\" id=\"skinBox\">"
                              ,"              正在读取皮肤列表,请稍候..."
                              ,"        </ul>"
                              ,"    </div>"
                              ,"    <div class=\"funBox\">"
                              ,"        <input type=\"button\" value=\"保存\" name=\"save\" class=\"button button_blue\">"
                              ,"        <input type=\"button\" value=\"取消\" name=\"cancel\" class=\"button button_gray\">"
                              ,"    </div>"
                              ,"</div>"].join("");

               var skinBox; // 皮肤列表 
               var saveBtn; // 保存
               var cancelBtn; // 取消
               var curSkin; // 当前选择的皮肤

               skinSelector = $(skinSelector);
               skinBox = skinSelector.find("#skinBox"); 
               saveBtn = skinSelector.find("input[name=save]");
               cancelBtn = skinSelector.find("input[name=cancel]");
               curSkin = "";

               // 加载皮肤列表
               IWB_API.listSkin("listskin" ,function (identity ,response) {
                   var skins;
                   var skin;
                   var skinBlock;
                   var i;
                   var noskin = (window.iwbResourceRoot ? iwbResourceRoot : "/") +  "resource/images/noskin.jpg";
                   if (response.ret === 0) {
                        skins = response.data;
                        skinBlock = [];
                        for (i=0; i<skins.length; i++) {
                            skin = skins[i];
                            skinBlock.push("<li data-folder=\"" + skin.foldername + "\">");
                            skinBlock.push("<img src=\"" + (skin.thumb ? skin.thumb : noskin) + "\"/>");
                            skinBlock.push("<p class=\"ico_lock\"></p>");
                            skinBlock.push("<p class=\"tempName\">" + (skin.name || "默认皮肤") + "</p>");
                            skinBlock.push("<div class=\"mask\"></div>");
                            skinBlock.push("</li>");
                        }
                        skinBlock = $(skinBlock.join(""));
                        skinBlock.click(function () {
                            var self = $(this);
                            var folder = self.attr("data-folder");
                            var skinCss = (window.iwbResourceRoot ? iwbResourceRoot : "/") + "view/" + folder + "/skin.css"; 
                            var link;

                            $("link[id=" + skinId + "]").remove();

                            // http://www.subchild.com/2010/05/20/cross-browser-problem-with-dynamic-css-loading-with-jquery-1-4-solved/
                            link = $("<link rel=\"stylesheet\" type=\"text/css\" href=\"" + skinCss + "\" media=\"screen, projection\" id=\"" + skinId + "\"/>").appendTo("head");
                            // link = $("<link/>").appendTo("head");

                            link.attr({
                                rel: "stylesheet"
                               ,type: "text/css"
                               ,href: skinCss
                               ,media: "screen, projection"
                               ,id: skinId
                            });

                            curSkin = self.attr("data-folder");
                        });
                        skinBox.html("");
                        skinBox.append(skinBlock);
                   } else {
                       IWB_DIALOG.modaltipbox("warning","读取皮肤列表失败，请稍候重试");
                   }
               });

               // 保存设置
               saveBtn.click(function () {
                   if (!curSkin) {
                       IWB_DIALOG.msgbox("warning" ,"请选择皮肤", {
                           showClose: false
                           ,modal: true
                           ,autoClose: {
                               wait: 1500
                               ,callback: null
                           }
                       });
                       return;
                   }
                   IWB_API.saveSkin("setskin" ,curSkin ,function (identity ,response) {
                       if (response.ret === 0) {
                           IWB_DIALOG.tipbox("success","皮肤设置保存成功");
                       } else {
                           IWB_DIALOG.tipbox("warning","皮肤设置保存失败");
                       }
                       IWB_DIALOG._disposeDialog(boxId);
                   });
               });

               // 刷新页面
               cancelBtn.click(function () {
                   $("link[id=" + skinId + "]").remove();
                   IWB_DIALOG._disposeDialog(boxId);
               });

               return skinSelector;
           } // end getDOM
        });// end dialog _init
    };

    // 换肤按钮
    $("#changeskin").click(function () {
        createSkinSelector();
    });

    //幻灯片组件
    if (window.sliderBanner && IWB_SILDEWARE && IWB_SESSION.get("showSlideAdv")==null) {
        // 格式化数据
        for (var i=0; i<sliderBanner.length; i++) {
            if(sliderBanner[i].description) {
                sliderBanner[i].title = sliderBanner[i].description;
            }
            if(sliderBanner[i].picture) {
                sliderBanner[i].pic = sliderBanner[i].picture;
            }
        }
        $("#sliderBanner").append(IWB_SILDEWARE(sliderBanner,576,129));
    }

    // 插件
    $("#iwbPlugin").hover(function () {
        $(this).trigger("click");
    }, function () {
    });

    $("#iwbPlugin").click(function (e) {
        e.stopPropagation();
        $("#iwbPluginList").toggle();
    });

    // 
    $("body").click(function () {
        $(".iwbAutoCloseLayer").hide();
    });

});

// 时间线
$(function () {
    // 时间线过滤
    $(".timelinefilter").change(function(){
        var check = $(this);
        var filter = check.attr("data-filter");
        var urlbase = location.href.match(/(.*)\/u\/\w+(\/[cu]type\/\d)?/);

        if (urlbase) {
            urlbase = urlbase[0]
        }

        if (check.prop('checked')) {
            location.href = urlbase + filter;
        } else {
            location.href = location.href.replace(filter,"");
        }
    });

    // 隔行换色
    $("#tmain > li").hover(function () {
        //$(this).css("background-color","#f8f8f8");
        $(".iwbUsercard").hide();
    } ,function () {
        //$(this).css("background-color","#ffffff");
    });

    // 创建转播，评论，对话框，基础框架
    var replyForm = function () {

        var instance = $(["<div class=\"replyform\">"
                        ,    "<em class=\"icon_angle\"></em>"
                        ,    "<a href=\"javascript:void(0);\" class=\"close\"></a>"
                        ,    "<ul class=\"top topinfo\">"
                       // ,        "<li class=\"gray\">转播原文，把它分享给你的听众</li>"
                       // ,        "<li class=\"gray\">顺便说两句：</li>"
                        ,    "</ul>"
                        ,    "<ul class=\"top\">"
                        ,        "<li><textarea id=\"treplyforminput\" class=\"iwbFriendControlInput\"></textarea></li>"
                        ,    "</ul>"
                        ,    "<div class=\"fleft\">"
                        ,        "<a href=\"javascript:void(0);\" class=\"icon_topic\"></a> <a href=\"javascript:void(0);\" class=\"iwbFriendControlBtn icon_at\" data-for=\"#treplyforminput\"></a> <a href=\"javascript:void(0);\" data-for=\"#treplyforminput\" class=\"iwbEmotesBtn icon_emotion\"></a>"
                     //  ,        "<input type=\"checkbox\" id=\"replayformcheckbox\">"
                     //   ,        "<label for=\"replayformcheckbox\">分享到QQ空间</label>"
                        ,    "</div>"
                        ,    "<div class=\"fright\">"
                        ,        "<label id=\"replyformtip\" class=\"label\">还能分享140字</label>"
                        ,       "<input type=\"hidden\" name=\"msgtype\" value=\"\"></input>"
                        ,       "<input type=\"hidden\" name=\"reid\" value=\"\"></input>"
                        ,        "<input type=\"button\" data-identity=\"timelineform\" class=\"replyformsubmit button button_blue\" title=\"快捷键 Ctrl+Enter\" value=\"\"></input>"
                        ,    "</div>"
                        ,    "<div class=\"fbottom\" style=\"clear:both;\"><div class=\"loading icon_loading\">正在读取转播列表，请稍候</div></div>"
                        ,"</div>"].join(""));
        
        var submit =  instance.find(".replyformsubmit");
        var relistBox = instance.find(".fbottom");
        var forminput = instance.find("#treplyforminput");
        var submitBtn = submit.get(0);
        var listbox = relistBox.get(0);

        var isvip = function ( authtype, msg) {
            return ((authtype === 1 || authtype === 3) && msg.localauth !== 0) || ((authtype === 2 || authtype === 3) && msg.isvip !== 0);
        };

        var formatRelist = function (data) {
            var infos = data.data.info;
            var ttl = data.data.totalnum;
            var htmlinfos = [];
            var posterinfo = [];
            var reposter = {length:0}; // 转播者的昵称，最多3个
            var i,info,author;
            var j=0;
            var authtype = data.authtype || 0; // 0 没开启认证 1 本地认证 2 平台认证 3 本地&平台都开启
        
            htmlinfos.push("<ul class=\"replylist\">");
            for (i=0;i<infos.length;i++) {
                info = infos[i];
                if (!reposter.hasOwnProperty(info.name) && reposter.length <= 3) {
                    reposter[info.name] = {
                        nick : info.nick,
                        vip: isvip(authtype,info)
                    };
                    reposter.length++;
                }
                htmlinfos.push("<li>");
                htmlinfos.push("<strong><a href=\"" + (window.iwbRoot ? iwbRoot : "/") + "u/" + info.name + "\" target=\"_blank\" title=\""+info.nick+"("+info.name+")"+"\">"+info.nick+"</a>" + (isvip(authtype,info) ? "<span class=\"icon_vip\"></span>" : "" )+ ":</strong>");
                if (info.type === 2) {
                    htmlinfos.push("<span>转播</span>");
                } else if (info.type === 7) {
                    htmlinfos.push("<span>评论</span>");
                }
                htmlinfos.push(info.text);
                htmlinfos.push("<span>"+info.timestring+"&nbsp;来自"+info.from+"</span>");
                if ( !(window.iwbUsername && iwbUsername === info.name)) { // 不能自己举报自己
                    htmlinfos.push("<a href=\"javascript:void(0);\" onclick=\"return false;\" class=\"iwbJuBao alarm\" style=\"display:none;\" data-id=\"" + info.id + "\">举报</a>");
                }
                htmlinfos.push("<a href=\"javascript:void(0);\" class=\"relay\" data-name=\""+info.name+"\" data-text=\""+info.origtext+"\">转播</a>");
                htmlinfos.push("<a href=\"javascript:void(0);\" class=\"reply\" data-name=\""+info.name+"\" data-text=\""+info.origtext+"\">评论</a>");
                htmlinfos.push("</li>");
            }
            if (data.count > 0) {
                htmlinfos.push("<li style=\"border-top-style:solid;\"><a href=\"" + (window.iwbRoot ? iwbRoot : "/index.php/") + "t/showt/tid/" + data.tid + "\">查看全部" + data.count + "次转播和评论>></a></li>");
            }
            htmlinfos.push("</ul>");
            for (author in reposter) {
                if (reposter.hasOwnProperty(author) && author !== "length" && j < 3) {
                    posterinfo.push("<a href=\"" + iwbRoot + "u/" + author + "\">" + reposter[author].nick + "</a>" + (reposter[author].vip ? "<span class=\"icon_vip\"></span>" : "" ));
                    j++;
                }
            }
            return "<div class=\"replylisttit\">" + "共有"+ttl+"人进行了转播和评论："+ posterinfo.join("、") + (reposter.length>=4?"等":"") + "</div>" + htmlinfos.join("");
        };

        IWB_API.chat.addObserver(submitBtn);
        IWB_API.reply.addObserver(submitBtn);
        IWB_API.repost.addObserver(submitBtn);
        IWB_API.relist.addObserver(listbox);


        listbox.onResponse = function (identity,response) {
            var relist;
            if (identity === relistBox.attr("data-identity")) {
                if (response.ret === 0) {
                    relist = $(formatRelist(response.data));
                    relist.find(".relay").click(function () {
                        var that = $(this);
                        var text = "|| "+"@"+that.attr("data-name")+":"+that.attr("data-text");
                        instance.find(".replyformsubmit").val("转播");
                        instance.find("input[name=msgtype]").val("2");
                        forminput.val(text);
                        forminput.val(text);
                        forminput.focus();
                        forminput.cursorPos(0);
                        forminput.get(0).caret=0;
                        forminput.trigger("keyup");
                    });
                    relist.find("li").hover(function () {
                        var self = $(this);
                        self.find(".iwbJuBao").toggle();
                    });
                    relist.find(".reply").click(function () {
                        var that = $(this);
                        var text = "|| "+"@"+that.attr("data-name")+":"+that.attr("data-text");
                        instance.find(".replyformsubmit").val("评论");
                        instance.find("input[name=msgtype]").val("4");
                        forminput.val(text);
                        forminput.focus();
                        forminput.cursorPos(0);
                        forminput.get(0).caret=0;
                        forminput.trigger("keyup");
                    });
                    relistBox.html("").append(relist);
                }
            }
        };

        submitBtn.onResponse = function (identity,response) {
            var self = $(this);
            var submitIdentity = submit.attr("data-identity");
            var msgtype = parseInt(instance.find("input[name=msgtype]").val(),10);
            var inlineTip = instance.find("#replyformtip");
            var tiptext = "";

            var tmessage;
            var tmessageHeight;
            var tmessageImage;
            var temssageImageSrc;
            var tmessageVideoPreview;
            var tmessageVideoPreviewSrc;

            if (identity === submitIdentity) {
                if (response.ret === 0) { // 转播/评论/对话操作成功
                    self.prop("disabled",false);
                    switch (msgtype) {
                        case 2:
                        tiptext = "转播";
                        break;
                        case 3:
                        tiptext = "对话";
                        break;
                        case 4:
                        tiptext = "评论";
                        break;
                    }
                    instance.detach();
                    IWB_DIALOG.tipbox(null,tiptext+"成功");

                    if (!window.iwbInstantTimeline) {
                        return;
                    }

                    // 发送广播成功动画效果 copy from sendbox js
                    tmessage = $(response.data);
                    tmessageImage = tmessage.find(".imageViewSmall");
                    tmessageVideoPreview = tmessage.find(".videopreview");

                    if (tmessageImage.length>0) { // 广播中带有图片，先去除此图片，待动画完成后再补上去
                        temssageImageSrc = tmessageImage.attr("src");
                        tmessageImage.attr("src","");
                        tmessageImage.hide();
                    }

                    if (tmessageVideoPreview.length>0) { // 广播中有视频预览图
                        tmessageVideoPreviewSrc = tmessageVideoPreview.attr("src"); // 保存图片路径
                        tmessageVideoPreview.attr("src",""); // 去除图片
                        tmessageVideoPreview.hide(); // 暂时隐藏此图片
                    }

                    tmessage.addClass("needRemove");

                    $("#tmain").first().prepend(tmessage);

                    tmessageHeight = tmessage.height();
                    
                    tmessage.css({
                        height: "0px" //纯文字动画起始高度
                    });
                    
                    tmessage.animate({
                        height: tmessageHeight+"px" // 纯文字动画结束高度
                    },600,function () {
                        tmessage.css({
                            height: "auto"
                        });
                        if (tmessageImage) {
                            tmessageImage.attr("src",temssageImageSrc);
                            tmessageImage.show();
                        }
                        if (tmessageVideoPreview) {
                            tmessageVideoPreview.attr("src",tmessageVideoPreviewSrc);
                            tmessageVideoPreview.show();
                        }
                    });
                    //
                } else {
                    inlineTip.blink(2,"<span class=\"minisendboxerror\">"+response.msg+"</span>",function () {
                        forminput.focus();
                        forminput.trigger("keyup");
                        self.prop("disabled",false);
                    });
                    inlineTip.addClass("formerror");
                }
            }
        };

        // 关闭按钮
        instance.find(".close").click(function() {
            instance.detach();
            $("body").trigger("click");
        });

        // 插入话题
        instance.find(".icon_topic").click(function() {
            IWB_UTIL.highlightOrInsert("输入话题标题" ,forminput.get(0));
            forminput.focus();
        });

        // 字数检查
        forminput.keyup(function(event) {
            if (event.keyCode === 17 || event.keyCode === 13) { // ctrl enter释放不刷新字数
                return;
            }
            var msgbox = $(this);
            var msglen = IWB_UTIL.msglen(msgbox.val());
            var sendmsg = instance.find("#replyformtip");
            var submit = instance.find(".replyformsubmit");
            var tip;

            forminput.get(0).caret = forminput.caret(); // 记录当前光标位置

            if (msglen<=140) {
                tip = "还能输入<big>"+(140-msglen)+"</big>字";
                sendmsg.removeClass("formerror");
            } else {
                tip = "超出<big style=\"color:#ff4700;\">"+(Math.abs(140-msglen) > 100?"很多":Math.abs(140-msglen))+"</big>字";
                sendmsg.addClass("formerror");
            }
            sendmsg.html(tip);
        }).keydown(function (event) {
            if (event.ctrlKey && (event.keyCode === 13 || event.keyCode === 10)) {
                if (submit.prop("disabled")) { // 提交按钮不允许被点击
                    return;
                }
                submit.trigger("click");
            }
        }).mouseup(function () {
            forminput.get(0).caret = forminput.caret(); // 记录当前光标位置
        });

        // 发表框前端校验
        var validateForm = function () {
            var errormsg; 
            var text = $.trim(forminput.val());
            
            if (text.length <= 0 && instance.find("input[name=msgtype]").val() !== "2") { // 转播允许空消息
                errormsg = "请输入内容";
            }
            
            if (/(#.+?#){3,}/.test(text)) {
                errormsg = "广播中不能多于三个话题";
            }

            return errormsg;
        }

       // 提交按钮
       submit.click(function () {
           var that = $(this);
           var tip = instance.find("#replyformtip");
           var tiptext = "";
           var msgtype = parseInt(instance.find("input[name=msgtype]").val(),10);
           var reid = instance.find("input[name=reid]").val();
           var content = forminput.val();
           var identity = that.attr("data-identity");

           if (tip.animating()) { // 必须等待报错的动画完成才能提交
               return;
           }

           // 已有错误
           if(tip.hasClass("formerror")) {
               tip.addClass("animating");
               tip.blink(2);
               return;
           }

           // 发送前再次检查字数
           forminput.focus(); //
           forminput.trigger("keyup");

           // 字数是否有错误
           if(tip.hasClass("formerror")) {
               tip.blink(2,function () {
                   forminput.focus(); 
                   forminput.trigger("keyup");
               });
               return;
           }

           // 检查其它错误
           errormsg = validateForm();
           if (errormsg) {
               tip.html(["<span class=\"minisendboxerror\">",errormsg,"</span>"].join(""));
               tip.addClass("formerror");
           }

           // 是否有其它错误
           if(tip.hasClass("formerror")) {
               tip.blink(0,function () {
                   forminput.focus();
                   forminput.trigger("keyup");
               });
               return;
           }

           // 发送请求
           switch (msgtype) {
               case 2: // 转播
               tiptext = "转播";
               IWB_API.repost(identity,reid,content);
               break;
               case 4: // 评论
               tiptext = "评论";
               IWB_API.reply(identity,reid,content);
               break;
               case 3: // 对话
               tiptext = "对话";
               IWB_API.chat(identity,reid,content);
               break;
           }
           
           tiptext += "中，请稍候";

           that.prop("disabled",true);

           tip.html("<span class=\"minisendboxinfo\">" + tiptext + "</span>");
       });

       instance.hide();

       this.instance = instance;
    };
    
    replyForm.prototype = {
        // 初始化回复框
        // 1 转播 2评论 3对话 4 查看转播与评论列表
        init: function (options) {

            var _instance = this.instance;

            _instance.attr("data-type",options.type);
            _instance.css({"display":"inline-block"});//_instance.show();

            // 清空提示文字
            _instance.find(".topinfo").html("");
            _instance.find(".fbottom").html("");
            _instance.find("#treplyforminput").val("");
            _instance.find("#replyformtip").removeClass("formerror").animating(false).text("还能输入140字");
            _instance.find(".icon_angle").show();

            
            // 重置按钮状态
            _instance.find(".replyformsubmit").prop("disabled",false);

            switch (options.type) {

                //转播
                case 1:

                // 默认文字
                if (options.defaultText) { 
                    _instance.find("#treplyforminput").val(options.defaultText);
                }

                // 转播提示信息
                _instance.find(".topinfo").append([
                    "<li class=\"gray\">"
                    ,"转播原文，把它分享给你的听众"
                    ,(options.count && options.count>0 && options.reid)?"，<a href=\"" + (window.iwbRoot ? iwbRoot : "/") + "t/showt/tid/" + options.reid + "\">共" + options.count + "条转播>></a>":""
                    ,"</li>"
                    ,"<li class=\"gray\">"
                    , "顺便说两句:"
                    ,(options.defaultText && options.defaultText.length>0)?"<a class=\"clearforminput\" href=\"javascript:void(0);\">[清空转播理由]</a>":""
                    ,"</li>"].join(""));

                // 清空文字
                if (options.defaultText && options.defaultText.length>0) {
                    _instance.find(".clearforminput").click(function () {
                        var replyforminputtext = _instance.find("#treplyforminput").val();
                        replyforminputtext = replyforminputtext.replace(options.defaultText,"");
                        _instance.find("#treplyforminput").focus();
                        _instance.find("#treplyforminput").val(replyforminputtext).trigger("keyup");
                        _instance.find(".clearforminput").hide();
                    });
                }

                // 箭头位置
                _instance.find(".icon_angle").css({
                    right: 108
                });

                // 按钮文字
                _instance.find(".replyformsubmit").val("转播");

                // 设置数据
                _instance.find("input[name=msgtype]").val("2");
                
                if (options.reid) {
                    _instance.find("input[name=reid]").val(options.reid);
                }

                // 更新identity，防止串时间线
                _instance.find(".replyformsubmit").attr("data-identity","timelinesubmit"+new Date().getTime());
                break;

                // 评论
                case 2:

                // 默认文字
                if (options.defaultText) { 
                    _instance.find("#treplyforminput").val(options.defaultText);
                }

                // 评论条数
                _instance.find(".topinfo").append([
                    "<li class=\"gray\">"
                    ,"评论原文"
                    ,(options.mcount && options.mcount>0 && options.reid)?"，<a href=\"" + (window.iwbRoot ? iwbRoot : "/") + "t/showt/tid/" + options.reid + "\">共"+options.mcount+"条评论>></a>":""
                    ,(options.defaultText && options.defaultText.length>0)?"<a class=\"clearforminput\" href=\"javascript:void(0);\">[清空评论]</a>":""
                    ,"</li>"].join(""));

                // 清空文字
                if (options.defaultText && options.defaultText.length>0) {
                    _instance.find(".clearforminput").click(function () {
                        var replyforminputtext = _instance.find("#treplyforminput").val();
                        replyforminputtext = replyforminputtext.replace(options.defaultText,"");
                        _instance.find("#treplyforminput").focus();
                        _instance.find("#treplyforminput").val(replyforminputtext).trigger("keyup");
                        _instance.find(".clearforminput").hide();
                    });
                }

                // 箭头位置
                _instance.find(".icon_angle").css({
                    right: 68
                });

                // 按钮文字
                _instance.find(".replyformsubmit").val("评论");

                // 设置数据
                _instance.find("input[name=msgtype]").val("4");
                
                if (options.reid) {
                    _instance.find("input[name=reid]").val(options.reid);
                }

                // 更新identity，防止串时间线
                _instance.find(".replyformsubmit").attr("data-identity","timelinesubmit"+new Date().getTime());
                break;
                
                // 对话
                case 3:
                // 转播提示信息
                _instance.find(".topinfo").append([
                    "<li class=\"gray\">"
                    ,"对话是半公开的，不会出现在你听众的主页上，但是可以到你的页面看到"
                    ,"</li>"
                    ,"<li class=\"gray\">"
                    , "对"
                    ,(options.nick && options.nick.length>0)?"<b>&nbsp;"+options.nick+"&nbsp;</b>":""
                    ,"说:</li>"].join(""));
                // 箭头位置
                _instance.find(".icon_angle").css({
                    right: 25 
                });

                // 按钮文字
                _instance.find(".replyformsubmit").val("对话");

                // 设置数据
                _instance.find("input[name=msgtype]").val("3");
                
                if (options.reid) {
                    _instance.find("input[name=reid]").val(options.reid);
                }

                // 更新identity，防止串时间线
                _instance.find(".replyformsubmit").attr("data-identity","timelinesubmit"+new Date().getTime());
                break;
                
                // 转播列表 流程与转播90%一样
                case 4:
                // 默认文字
                if (options.defaultText) { 
                    _instance.find("#treplyforminput").val(options.defaultText);
                }

                // 转播提示信息
                _instance.find(".topinfo").append([
                    "<li class=\"gray\">"
                    ,"&nbsp;"
                    ,"</li>"
                    ,"<li class=\"gray\" style=\"height:10px;\">"
                    , "&nbsp;"
                    ,"</li>"].join(""));

                // 清空文字
                _instance.find(".clearforminput").click(function () {
                    _instance.find("#treplyforminput").val("").trigger("keyup");
                });

                // 箭头位置
                _instance.find(".icon_angle").hide();

                // 按钮文字
                _instance.find(".replyformsubmit").val("转播");

                // 设置数据
                _instance.find("input[name=msgtype]").val("2");
                
                if (options.reid) {
                    _instance.find("input[name=reid]").val(options.reid);
                }

                // 更新identity，防止串时间线
                _instance.find(".replyformsubmit").attr("data-identity","timelinesubmit"+new Date().getTime());

                //
                _instance.find(".fbottom").attr("data-identity","timelinerelist"+new Date().getTime());
                _instance.find(".fbottom").html("<div class=\"loading icon_loading\">正在读取转播数据，请稍候...</div>");

                // 读取数据
                IWB_API.relist(_instance.find(".fbottom").attr("data-identity"),options.reid);
                break;
            }
        },
        attachTo: function (obj) {
            this.instance.detach();
            obj.append(this.instance);
        },
        getType: function () {
            return parseInt(this.instance.attr("data-type"),10);
        },
        detach: function () {
            this.instance.attr("data-type","");
            this.instance.detach();
        },
        focus: function () {
            this.instance.find("#treplyforminput").focus();
        },
        updateTextCounter: function () {
            this.focus();
            this.instance.find("#treplyforminput").trigger("keyup");
        },
        resetCursor: function () {
            this.instance.find("#treplyforminput").cursorPos(0);
            this.instance.find("#treplyforminput").get(0).caret = 0;
        }
    };

    // 初始化对话框
    var replyform = new replyForm();
    $("body").append(replyform.instance);

    // 转播
    $(".tzhuanbo").live({
        click: function () {
            var that = $(this);
            var id = that.attr("data-identity");
            var replyhost = $("#"+that.attr("data-msgid")).find(".tbottom");
            var hasform = replyhost.find(".replyform").length > 0;
            var type = 1;
            var defaultText="";
            var orignText = that.attr("data-text");
            if (hasform && replyform.getType() === type) {
                replyform.detach();
                return;
            }
            if (orignText) {
                defaultText = "|| @"+that.attr("data-name") + ":" + orignText;
            }
            replyform.init({
                type: type,
                reid: that.attr("data-reid"),
                count: that.attr("data-count"),
                defaultText: defaultText
            });
            replyform.attachTo(replyhost);
            replyform.focus();
            replyform.resetCursor();
            if (defaultText) {
                replyform.updateTextCounter();
            }
        }
    });
    
    // 评论
    $(".tdianping").live({
        click: function () {
            var that = $(this);
            var replyhost = $("#"+that.attr("data-msgid")).find(".tbottom");
            var hasform = replyhost.find(".replyform").length > 0;
            var type = 2;
            var defaultText="";
            var orignText = that.attr("data-text");
            if (hasform && replyform.getType() === type) {
                replyform.detach();
                return;
            }
            if (orignText) {
                defaultText = "|| @"+that.attr("data-name") + ":" + orignText;
            }
            replyform.init({
                type: type,
                reid: that.attr("data-reid"),
                mcount: that.attr("data-mcount"),
                defaultText: defaultText
            });
            replyform.attachTo(replyhost);
            replyform.focus();
            if (defaultText) {
                replyform.updateTextCounter();
            }
        }
    });
    
    // 对话
    $(".tduihua").live({
        click: function () {
            var that = $(this);
            var replyhost = $("#"+that.attr("data-msgid")).find(".tbottom");
            var hasform = replyhost.find(".replyform").length > 0;
            var type = 3;
            if (hasform && replyform.getType() === type) {
                replyform.detach();
                return;
            }
            replyform.init({
                type: type,
                reid: that.attr("data-reid"),
                nick: that.attr("data-nick")
            });
            replyform.attachTo(replyhost);
            replyform.focus();
        }
    });
    
    // 查看转播/评论列表
    $(".tchakan").live({
        click: function () {
            var that = $(this);
            var replyhost = $("#"+that.attr("data-msgid")).find(".tbottom");
            var hasform = replyhost.find(".replyform").length > 0;
            var type = 4;
            var defaultText="";
            var orignText = that.attr("data-text");
            if (hasform && replyform.getType() === type) {
                replyform.detach();
                return;
            }
            if (orignText) {
                defaultText = "|| @"+that.attr("data-name") + ":" + orignText;
            }
            replyform.init({
                type: type,
                reid: that.attr("data-reid"),
                defaultText: defaultText
            });
            replyform.attachTo(replyhost);
            replyform.focus();
            if (defaultText) {
                replyform.updateTextCounter();
            }
        }
    });

    // 收藏
    $(".favaction").live({
        click: function () {
            var that = $(this);
            var msgid = that.attr("data-msgid");
            var tmessage =  $("#"+msgid);
            var tmain = $("#tmain");
            IWB_API.addFavor.addObserver(that);
            IWB_API.delFavor.addObserver(that);
            if (!that.get(0).onResponse) {
                that.get(0).onResponse = function (identity ,response) {
                    if (identity === msgid) {
                        if (response.ret===0){
                            //由于共享dom 需要根据class判断是收藏还是取消收藏
                            if (that.hasClass("tshoucang")) {
                                that.removeClass("tshoucang").addClass("txshoucang");
                                that.text("取消收藏");
                            } else {
                                if (window.iwbTimelineMoreType === 4) { // 收藏时间线直接删除
                                    tmessage.animate({
                                        height: 0
                                    },300,function () {
                                        tmessage.remove();
                                        // 已无收藏记录
                                        if (tmain.find("li").length <= 0) {
                                            tmain.after("<p class=\"nocollection\" id=\"tmainnorecord\">暂无内容</p>");
                                        }
                                    });
                                    return;
                                }
                                that.removeClass("txshoucang").addClass("tshoucang");
                                that.text("收藏");
                            }
                        } else {
                            IWB_DIALOG.tipbox("warning","取消收藏失败");
                        }
                    }
                };
            }

            if (that.hasClass("tshoucang")) {
                IWB_API.addFavor(msgid,msgid);
            } else {
                IWB_API.delFavor(msgid,msgid);
            }
        }
    });    

    // 删除
    $(".tshanchu").live({
        click: function () {
            var that = $(this);
            var msgid = that.attr("data-msgid");
            IWB_API.del.addObserver(that);
            if (!that.get(0).onResponse) {
                that.get(0).onResponse = function (identity ,response) {
                    var tmessage;
                    if (identity === msgid) {
                        if (response.ret===0){
                            tmessage = $("#"+msgid);
                            tmessage.animate({
                                height: 0
                            },300,function () {
                                tmessage.remove();
                            });
                        } else {
                            IWB_DIALOG.tipbox("warning","删除失败");
                        }
                    }
                };
            }

            IWB_DIALOG.confirmbox({
                text: "确定删除这条广播？",
                top: that.offset().top - 50,
                left: that.offset().left - 30,
                ok: function () {
                    IWB_API.del(msgid,msgid);
                }
            });
        }
    });

});

// 举报
$(function () {
    var createJuBaoBox = function (type ,val) {
        var boxId;
        var boxWidth = 570;
        var boxHeight = 410;
        var boxLeft = ($("body").width() - boxWidth) / 2;
        var boxTop = (document.documentElement.scrollTop || document.body.scrollTop) + 1 /*0.618*/ * (document.documentElement.clientHeight - boxHeight) / 2;
        var frameUrl = window.iwbRoot ? iwbRoot : "/index.php/";
        switch (type) {
            case "msgid":
            frameUrl += ("t/report/tid/" + val);
            break;
            case "username":
            frameUrl += ("t/report/name/" + val);
            break;
        };
        boxId = IWB_DIALOG._init({
            modal: true
           ,showClose: true
           ,width: boxWidth
           ,height: boxHeight
           ,top: boxTop
           ,left: boxLeft
           ,getDOM: function () {
               var jubao = "<iframe src=\"" + frameUrl + "\" frameBorder=\"0\"></iframe>";
               jubao = $(jubao);
               jubao.css({
                    width: boxWidth
                   ,height:boxHeight
                   ,border:0
               });
               return jubao;
           } // end get DOM
        }); // end dialog init
    };

    var createJuBaoBoxById = function (id) {
        createJuBaoBox("msgid" ,id);
    };
    var createJuBaoBoxByName = function (name) {
        createJuBaoBox("username" ,name);
    };

    $(".iwbJuBao").live({
        click: function () {
                   var self = $(this);
                   var id = self.attr("data-id");
                   var name = self.attr("data-name");
                   if (id) {
                       createJuBaoBoxById(id);
                   } else if (name) {
                       createJuBaoBoxByName(name);
                   }
               }
    });

});

// 单条转播默认打开转播框
$(function () {
    $(".tzhuanbo").first().trigger("click");
});
