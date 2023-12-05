<style type="text/css">
    .bb  {border-collapse:collapse;border-spacing:0;}
    .bb td{font-family:Arial, sans-serif;font-size:14px;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:black;}
    .bb th{font-family:Arial, sans-serif;font-size:14px;font-weight:normal;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:black;}
    .bb .bb-bold-blue-left{font-weight:bold;background-color:#dae8fc;border-color:inherit;text-align:left;vertical-align:top}
    .bb .bb-bold-right{font-weight:bold;border-color:inherit;text-align:right;vertical-align:top}
    .bb .bb-norm{border-color:inherit;text-align:left;vertical-align:top}
    .bb .bb-bold-left{font-weight:bold;border-color:inherit;text-align:left;vertical-align:top}
    .bb .bb-warning{background-color:#ffce93;border-color:inherit;text-align:left;vertical-align:top}
</style>
<table class="bb">
    <tr>
        <th class="bb-bold-right">Date:</th>
        <th class="bb-norm">${data.noticeDate}</th>
        <th class="bb-norm" rowspan="3"> </th>
        <th class="bb-norm" colspan="3" rowspan="3"><b>Ship From</b><br>
                ${data.contactName}<br>
                ${data.contactStreet}<br>
                ${data.contactCity}, ${data.contactState} ${data.contactZip}
        </th>
    </tr>
    <tr>
        <td class="bb-bold-right">Conf #:</td>
        <td class="bb-norm" >${data.confirmID}</td>
    </tr>
    <tr>
        <td class="bb-bold-right">Type:</td>
        <td class="bb-norm" >${data.operation}</td>
    </tr>

</table>

<#if data.lines?has_content>
<table class="bb">
    <tr>
        <th class="bb-bold-blue-left">Line</th>
        <th class="bb-bold-blue-left">Orig Qty</th>
        <th class="bb-bold-blue-left">Qty</th>
        <th class="bb-bold-blue-left">UOM</th>
        <th class="bb-bold-blue-left">Delivery Date</th>
        <th class="bb-bold-blue-left">Orig Price</th>
        <th class="bb-bold-blue-left">Price</th>
        <th class="bb-bold-blue-left">Comments</th>
    </tr>
    <#list data.lines as item>
        <tr>
            <td class="${item.class}">${item.line}</td>
            <td class="${item.class}">${item.orgQty}</td>
            <td class="${item.class}">${item.qty}</td>
            <td class="${item.class}">${item.uom}</td>
            <td class="${item.class}">${item.deliveryDate}</td>
            <td class="${item.class}">${item.orgPrice}</td>
            <td class="${item.class}">${item.price}</td>
            <td class="${item.class}">${item.comments}</td>
        </tr>
    </#list>
</table>
</#if>