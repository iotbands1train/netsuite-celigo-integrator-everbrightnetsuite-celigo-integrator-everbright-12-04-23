<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<pdf>
    <head>
        <style>
            body {
                font-family: Arial, Helvetica, sans-serif;
            }

            h1, h2, h3, h4 {
                font-family: Arial, Helvetica, sans-serif;
            }

            table {
                width: 100%;
            }

            table td, table th {
                border: 1px solid black;
            }

            table th {
                font-weight: bold;
            }

            .quantity {
                width: 1in;
            }
        </style>

        <macrolist>
            <macro id="footer">
                <table>
                    <tr>
                        <td>
                            Printed ${.now}
                        </td>
                        <td align="right">
                            Page <pagenumber/> of <totalpages/>
                        </td>
                    </tr>
                </table>
            </macro>
        </macrolist>
    </head>
    <body size="Letter-landscape" footer="footer">
        <h1>Project Bill of Materials</h1>
        <h1>${project.name.value?replace("&","&amp;")}</h1>
        <h3>${project.address1.value}<br/>
        <#if project.address2.value?has_content>
           <#assign address2 = project.address2.value?trim>
           <#if address2?has_content>
               ${project.address2.value}<br/>
           </#if>
        </#if>
        ${project.city.value}, ${project.state.text} ${project.zip.value}</h3>
        <#list project.bomList>
            <table style="width:100%">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th></th>
                        <th></th>
                        <th class="quantity">Design</th>
                        <th class="quantity">Extra<br/>Loaded</th>
                        <th class="quantity">Used</th>
                        <th class="quantity">Returned<br/>on Truck</th>
                        <#if project.isBinEnabled=="true"><th class="quantity">Inventory in Bins</th></#if>
                    </tr>
                </thead>
                <tbody>
                    <#items as bom>
                        <#assign name = "">
                        <#assign binDetails = bom.binDetails>
                        <#assign name = bom.name.value>
                        <#if name?contains(" : ")>
                            <#assign lastPart = name?keep_after_last(" : ")>
                        <#else>
                            <#assign lastPart = name>
                        </#if>

                        <tr>
                            <td>${lastPart?html}</td>
                            <td>${bom.displayName.value?html}</td>
                            <td>
                                <#assign thumbnailUrl = "">
                                <#assign thumbnailUrl = bom.thumbnailUrl.value?trim>
                                <#if thumbnailUrl?has_content>
                                    <img class="thumbnail" src="${thumbnailUrl?html}" height="80" width="80" />
                                </#if>
                            </td>
                            <td>${bom.quantity.value}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <#if project.isBinEnabled=="true"><td><ul>
                                    <#list binDetails as bins>
                                      <li>${bins.BinNumber.text} : ${bins.onHand.value}</li>
                                    </#list>
                                  </ul></td></#if>
                        </tr>
                    </#items>
                </tbody>
            </table>
        <#else>
            <b>This project does not contain a bill of materials.</b>
        </#list>
    </body>
</pdf>