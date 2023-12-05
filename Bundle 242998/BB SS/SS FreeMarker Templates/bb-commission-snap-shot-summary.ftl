<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<pdf>
<head>
    <link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />
    <#if .locale == "zh_CN">
        <link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />
    <#elseif .locale == "zh_TW">
        <link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />
    <#elseif .locale == "ja_JP">
        <link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />
    <#elseif .locale == "ko_KR">
        <link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />
    <#elseif .locale == "th_TH">
        <link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />
    </#if>
    <macrolist>
        <macro id="nlheader">
            <table class="header" style="width: 100%;"><tr>
    <td rowspan="3"><img src="https://tstdrv1910037.app.netsuite.com/core/media/media.nl?id=2869&amp;c=TSTDRV1910037&amp;h=33d7d5804c5ec9764d7e" style="float: left; margin: 7px" /> <span class="nameandaddress"></span><br /><span class="nameandaddress"></span></td>
    <td align="right"><span class="title">Commissions Payable Summary</span></td>
    </tr>
    <tr>
    <td align="right"><span class="number">Payroll Period</span></td>
    </tr>
    <tr>
    <td align="right">${snapshot.payrollPeriod}</td>
    </tr></table>
        </macro>
        <macro id="nlfooter">
            <table class="footer" style="width: 100%;"><tr>
    <td align="right"><pagenumber/> of <totalpages/></td>
    </tr></table>
        </macro>
    </macrolist>
    <style type="text/css">* {
        <#if .locale == "zh_CN">
            font-family: NotoSans, NotoSansCJKsc, sans-serif;
        <#elseif .locale == "zh_TW">
            font-family: NotoSans, NotoSansCJKtc, sans-serif;
        <#elseif .locale == "ja_JP">
            font-family: NotoSans, NotoSansCJKjp, sans-serif;
        <#elseif .locale == "ko_KR">
            font-family: NotoSans, NotoSansCJKkr, sans-serif;
        <#elseif .locale == "th_TH">
            font-family: NotoSans, NotoSansThai, sans-serif;
        <#else>
            font-family: NotoSans, sans-serif;
        </#if>
        }
        table {
            font-size: 9pt;
            table-layout: fixed;
        }
        th {
            font-weight: bold;
            font-size: 8pt;
            vertical-align: middle;
            padding: 5px 6px 3px;
            background-color: #e3e3e3;
            color: #333333;
        }
        td {
            padding: 4px 6px;
        }
        td p { align:left }
        b {
            font-weight: bold;
            color: #333333;
        }
        table.header td {
            padding: 0;
            font-size: 10pt;
        }
        table.footer td {
            padding: 0;
            font-size: 8pt;
        }
        table.itemtable th {
            padding-bottom: 10px;
            padding-top: 10px;
        }
        table.body td {
            padding-top: 2px;
        }
        table.total {
            page-break-inside: avoid;
        }
        tr.totalrow {
            background-color: #e3e3e3;
            line-height: 200%;
        }
        td.totalboxtop {
            font-size: 12pt;
            background-color: #e3e3e3;
        }
        td.addressheader {
            font-size: 8pt;
            padding-top: 6px;
            padding-bottom: 2px;
        }
        td.address {
            padding-top: 0;
        }
        td.totalboxmid {
            font-size: 28pt;
            padding-top: 20px;
            background-color: #e3e3e3;
        }
        td.totalboxbot {
            background-color: #e3e3e3;
            font-weight: bold;
        }
        span.title {
            font-size: 16pt;
        }
        span.number {
            font-size: 16pt;
        }
        span.itemname {
            font-weight: bold;
            line-height: 150%;
        }
        hr {
            width: 100%;
            color: #d3d3d3;
            background-color: #d3d3d3;
            height: 1px;
        }
</style>
</head>
    <body header="nlheader" header-height="18%" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">
        <p>Sales Rep - ${snapshot.salesRepName} </p>

        <#list snapshot.projectArr>
            <table style="width:100%">
                <#if snapshot.sendType?has_content>
                    <thead>
                        <tr>
                            <th align="left" colspan="5">Project</th>
                            <th colspan="3">Paid Amount</th>
                            <th colspan="3">Contract Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <#items as projects>
                            <tr>
                                <td align="left" colspan="5" line-height="150%">${projects.projectName}</td>
                                <td colspan="3">${projects.commAmtOwed}</td>
                                <td colspan="3">${projects.totalContractAmt}</td>
                            </tr>
                        </#items>
                    </tbody>
                <#else>
                    <thead>
                        <tr>
                            <th align="left" colspan="10">Project</th>
                        </tr>
                    </thead>
                    <tbody>
                        <#items as projects>
                            <tr>
                                <td align="left" colspan="10" line-height="150%">${projects.projectName}</td>
                            </tr>
                        </#items>
                    </tbody>
                </#if>
            </table>
        <#else>
            <b></b>
        </#list>
    </body>
</pdf>