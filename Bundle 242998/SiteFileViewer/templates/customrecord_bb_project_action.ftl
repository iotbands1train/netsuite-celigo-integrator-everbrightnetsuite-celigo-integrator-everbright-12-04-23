<!-- Backup of original -->
<!-- Bootstrap core CSS -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet">
<link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"
      integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">
<!-- JQuery -->
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
<meta name="viewport" content="width=device-width, initial-scale=1">

<div class="container">
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
                                <a target="_" href="${file.url}">
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
</div>



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
        min-height: 50px;
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
</script>