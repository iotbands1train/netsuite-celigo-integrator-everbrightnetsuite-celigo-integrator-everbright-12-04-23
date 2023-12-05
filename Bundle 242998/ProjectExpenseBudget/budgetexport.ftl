<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:html="http://www.w3.org/TR/REC-html40">
    <ss:Styles>
        <ss:Style ss:ID="currency">
            <NumberFormat ss:Format="Standard"/>
        </ss:Style>
    </ss:Styles>
    <Worksheet ss:Name="Sheet1">
        <Table>
            <Row>
                <Cell><Data ss:Type="String">Section</Data></Cell>
                <Cell><Data ss:Type="String">Item</Data></Cell>
                <Cell><Data ss:Type="String">Amount</Data></Cell>
                <#list data.seqNames as name>
                    <Cell><Data ss:Type="String">${name}</Data></Cell>
                </#list>
            </Row>
            <#list data.sections as section>
                <#list section.items as item>
                    <Row>
                        <Cell><Data ss:Type="String">${section.title}</Data></Cell>
                        <Cell><Data ss:Type="String">${item.title}</Data></Cell>
                        <Cell ss:StyleID="currency"><Data ss:Type="Number">${item.amount}</Data></Cell>
                        <#list 1..(data.seqCount?number) as n>
                            <#assign values=item.seqData[n-1]>
                            <Cell ss:StyleID="currency"><Data ss:Type="Number">${values.amount}</Data></Cell>
                        </#list>
                    </Row>
                </#list>
            </#list>
        </Table>
    </Worksheet>
</Workbook>