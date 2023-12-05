<style type="text/css">
            #jquery-script-menu{position:absolute;height:90px;width:100%;top:0;left:0;border-top:5px solid #316594;background:#fff;-moz-box-shadow:0 2px 3px 0 rgba(0,0,0,.16);-webkit-box-shadow:0 2px 3px 0 rgba(0,0,0,.16);box-shadow:0 2px 3px 0 rgba(0,0,0,.16);z-index:999999;padding:10px 0;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box}.jquery-script-center{max-width:960px;margin:0 auto}.jquery-script-center ul{width:212px;float:left;line-height:45px;margin:0;padding:0;list-style:none}.jquery-script-center a{text-decoration:none}.jquery-script-ads{max-width:728px;height:90px;float:right}.jquery-script-clear{clear:both;height:0}#carbonads{display:block;overflow:hidden;max-width:728px;position:relative;font-size:22px;box-sizing:content-box}#carbonads>span{display:block}#carbonads a{color:#4078c0;text-decoration:none}#carbonads a:hover{color:#3664a3}.carbon-wrap{display:flex;align-items:center}.carbon-img{display:block;margin:0;line-height:1}.carbon-img img{display:block;height:90px;width:auto}.carbon-text{display:block;padding:0 1em;line-height:1.35;text-align:left}.carbon-poweredby{display:block;position:absolute;bottom:0;right:0;padding:6px 10px;text-align:center;text-transform:uppercase;letter-spacing:.5px;font-weight:600;font-size:8px;border-top-left-radius:4px;line-height:1;color:#aaa!important}@media only screen and (min-width:320px) and (max-width:759px){.carbon-text{font-size:14px}}@media only screen and (max-width:1023px){.jquery-script-ads{display:none}}

            .site-cm-box{border:1px solid #d2d2d2;-webkit-border-radius:4px;-moz-border-radius:4px;border-radius:4px;background-color:#fff}
            .site-cm-box ul.site-cm-group li{height:36px;padding-left:20px;padding-right:20px;line-height:36px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;cursor:default}
            .site-cm-box .site-cm-separ{height:0;border-top:1px solid #d2d2d2}
            .site-cm-box ul.site-cm-group li:hover,.site-cm-box ul.site-cm-group li.hover{color:#fff;background-color:#33ce61}
            .site-cm-box ul.site-cm-group li>.site-cm-box{left:185px;margin-top:-36px}.site-cm-box ul.site-cm-group li:hover>.site-cm-box,.site-cm-box ul.site-cm-group li.hover>.site-cm-box{color:#000}
            .site-cm-icon{color:#666;width:20px}
            .site-cm-box ul{padding-inline-start:0 !important;}
        </style>

        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" integrity="sha512-iBBXm8fW90+nuLcSKlbmrPcLa0OT92xO1BIsZ+ywDWZCvqsWgccV3gFoRBv0z+8dLJgyAHIhR35VZc2oM/gI1w==" crossorigin="anonymous" referrerpolicy="no-referrer" />



<!-- Bootstrap core CSS -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet">
<link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"
      integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">
<!-- JQuery -->
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>

<#if data.load == 'true'>
    <div class="accordion">
        <#list data.packages as package>
            <div class="card">
                <div class="card-header">
                    <i class="fa fa-plus-square"></i>
                    <div class="mb-0 d-inline">
                        ${package.packageName}
                    </div>
                </div>
                <div class="card-body">
                    <div class="accordion">
                        <#list package.packageActions as action>
                            <div class="card">
                                <div class="card-header">
                                    <i class="fa fa-minus-square"></i>
                                    <div class="mb-0 d-inline">
                                        ${action.packageActionName}
                                    </div>
                                </div>
                                <div class="card-body tiles">
                                    <#list action.files as file>
                                        <div class="tile">
                                            <a target="_" href="/app/site/hosting/scriptlet.nl?script=customscript_bb_s3_sl_showfile&amp;deploy=customdeploy_bb_s3_sl_showfile&amp;name=${file.path}">
                                                <#assign bgImage = "https://img.icons8.com/document" />
                                               <#assign imagePath = file.path />
                                                <#if file.filename?lower_case?keep_after_last(".")?matches("(jpg|jpeg|gif|png)")>
                                                    <#assign bgImage = "https://img.icons8.com/image" />
                                                    <#assign imagePath = file.thumbpath />
                                                 <#elseif  file.filename?lower_case?keep_after_last(".")?matches("(pdf)")>
                                                    <#assign bgImage = "https://img.icons8.com/officexs/72/pdf.png" />
                                                <#elseif  file.filename?lower_case?keep_after_last(".")?matches("(xls|xlsx)")>
                                                    <#assign bgImage = "https://img.icons8.com/officexs/72/xls.png" />
                                                </#if>
                                                <img class="preview-image" style="background-image: url('${bgImage}')" src="/app/site/hosting/scriptlet.nl?script=customscript_bb_s3_sl_showfile&amp;deploy=customdeploy_bb_s3_sl_showfile&amp;preview=true&amp;name=${imagePath}"/>
                                                <br/>
                                                <span>${file.filename}</span>
                                            </a>
                                        </div>
                                    </#list>
                                </div>
                            </div>
                        </#list>
                    </div>
                </div>
            </div>
        </#list>
    </div>
<#else>
    <a href="${data.loadUrl}" target="_self" class="btn btn-primary">Show Files</a>
</#if>


<style>
    .card-header {
        cursor: pointer;
    }
    .accordion>.card:last-of-type {
        border-bottom: 1px solid rgba(0,0,0,.125);
    }
    .card-header {
        padding: .5rem 1rem
    }
    .card-body {
        padding: .5rem
    }
    .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        grid-gap: 10px;
    }

    .tile {
        padding: 10px;
        text-align: center;
        display: block;
        background: lightgray;
        font-size: 12px;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    }

    .tile a {
        text-decoration: none;
        color: black;
    }
    .preview-image {
        min-height: 70px;
        min-width: 50px;
        max-width: 172px;
        background-repeat: no-repeat;
        background-position: center;
    }
</style>

<script>
  jQuery(function() {
    jQuery(".accordion .card-body").hide();

    jQuery(".accordion .card-header").each(function() {
      if(jQuery(this).parent().has('.card')) {
        jQuery(this).click(function() {
          var clicked = jQuery(this);
          if(clicked.has('.fa-minus-square').length){
            clicked.find('.fa').removeClass('fa-minus-square');
            clicked.find('.fa').addClass('fa-plus-square');
          } else {
            clicked.find('.fa').removeClass('fa-plus-square');
            clicked.find('.fa').addClass('fa-minus-square');
          }
          clicked.parent().find('.card-body').toggle();
        });
      }
    });
  });

// CONTEXT MENU
(function ($) {

    $.fn.contextMenu = function (data, options) {
        //console.log('contextMenu',data,options);
        var _contextMenuTarget;
        var $body = $("body"),
            defaults = {name: "", offsetX: 15, offsetY: 5, beforeShow: $.noop, afterShow: $.noop};
        var params = $.extend(defaults, options || {}), keyMap = {}, idKey = "site_cm_", classKey = "site-cm-",
            name = name || ("JCM_" + +new Date() + (Math.floor(Math.random() * 1000) + 1)), count = 0;
        var buildMenuHtml = function (mdata) {
            var menuData = mdata || data, idName = idKey + (mdata ? count++ : name), className = classKey + "box";
            var $mbox = $('<div id="' + idName + '" class="' + className + '" style="position:absolute; display: none;">');
            $.each(menuData, function (index, group) {
                if (!$.isArray(group)) {
                    throw TypeError()
                }
                index && $mbox.append('<div class="' + classKey + 'separ">');
                if (!group.length) {
                    return
                }
                var $ul = $('<ul class="' + classKey + 'group">');
                $.each(group, function (innerIndex, item) {
                    var key,
                        $li = $("<li>" + item.text + ($.isArray(item.items) && item.items.length ? buildMenuHtml(item.items) : "") + "</li>");
                    $.isFunction(item.action) && (key = (name + "_" + count + "_" + index + "_" + innerIndex), keyMap[key] = item.action, $li.attr("data-key", key));
                    $ul.append($li).appendTo($mbox)
                })
            });
            var html = $mbox.get(0).outerHTML;
            $mbox = null;
            return html
        }, createContextMenu = function (obj) {
            console.log('each on createContextMenu',obj);
            _contextMenuTarget = obj;
            var $menu = $("#" + idKey + name);
            if (!$menu.length) {
                var html = buildMenuHtml();
                $menu = $(html).appendTo($body);
                $("li", $menu).on("mouseover", function () {
                    $(this).addClass("hover").children("." + classKey + "box").show()
                }).on("mouseout", function () {
                    $(this).removeClass("hover").children("." + classKey + "box").hide()
                }).on("click", function () {
                    var key = $(this).data("key");
                    console.log(_contextMenuTarget);
                    key && (keyMap[key].call(_contextMenuTarget) !== false) && $menu.hide()
                });
                $menu.on("contextmenu", function () {
                    return false
                })
            }
            return $menu
        };
        $body.on("mousedown", function (e) {
            var jid = ("#" + idKey + name);
            !$(e.target).closest(jid).length && $(jid).hide()
        });
        return this.each(function () {
            //console.log('each',this);
            $(this).on("contextmenu", function (e) {
                if ($.isFunction(params.beforeShow) && params.beforeShow.call(this, e) === false) {
                    return
                }
                e.cancelBubble = true;
                e.preventDefault();
                //console.log('each on',this);
                var $menu = createContextMenu(this);
                $menu.show().offset({left: e.pageX + params.offsetX, top: e.pageY + params.offsetY});
                $.isFunction(params.afterShow) && params.afterShow.call(this, e)
            })
        })
    }
})(jQuery);


function download(url, filename) {
    fetch(url).then(function(t) {
        return t.blob().then((b)=>{
                var a = document.createElement("a");
                a.href = URL.createObjectURL(b);
                a.setAttribute("download", filename);
                a.click();
            }
        );
    });
}

var data = [
    [
        {
            text: '<i class="fas fa-file-download" style="margin-right:5px"></i> Download File',
            action: function () {
                //console.log("Download File",this);
                var target=$(this);
                //console.log("target",target);
                var downloadURL = target.find('a').attr('href');
                var fileName = downloadURL.substr(downloadURL.lastIndexOf('/')+1);
                downloadURL +="&download=t";
                //console.log(downloadURL);
                jQuery.get(downloadURL,function(presignedURL){
                    //console.log(presignedURL);
                    download(presignedURL, fileName);
                });
            }
        },
        {
            text: '<i class="fas fa-file-download" style="margin-right:5px"></i> View Full Sized File',
            action: function () {
                //console.log("View File",this);
                var target=$(this);
                //console.log("target",target);
                //console.log(target.find('a').attr('href'));
                window.open(target.find('a').attr('href'),"_blank");
            }
        }
    ]
];

jQuery('.tile').contextMenu(data,this);
console.log('BB.ShowAllPaFiles.ftl');
</script>