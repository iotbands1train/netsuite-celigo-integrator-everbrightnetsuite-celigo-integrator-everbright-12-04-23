<?xml version="1.0" encoding="utf-8"?>
<cXML payloadID="${data.payload_id}" timestamp="${.now?iso_local}" xml:lang="en-US" version="1.2.017">
    <Header>
        <From>
            <Credential domain="${data.header.from.domain}">
                <Identity>${data.header.from.identity}</Identity>
            </Credential>
        </From>
        <To>
            <Credential domain="${data.header.to.domain}">
                <Identity>${data.header.to.identity}</Identity>
            </Credential>
        </To>
        <Sender>
            <Credential domain="${data.header.sender.domain}">
                <Identity>${data.header.sender.identity}</Identity>
                <SharedSecret>${data.header.sender.secret}</SharedSecret>
            </Credential>
            <UserAgent>${data.header.sender.useragent}</UserAgent>
        </Sender>
    </Header>
    <Request deploymentMode="${data.request.deployment_mode}">
        <OrderRequest>
            <OrderRequestHeader orderDate="${data.po.expected_shp_dt}" orderID="${data.po.id}" orderVersion="${data.po.version}" type="${data.po.type}">
                <Total>
                    <Money currency="USD">${data.po.total}</Money>
                </Total>
                <ShipTo>
                    <Address addressID="${data.po.ship.id}" isoCountryCode="US">
                        <Name xml:lang="en">${data.po.ship.company}</Name>
                        <PostalAddress name="default">
                            <DeliverTo>${data.po.ship.atten}</DeliverTo>
                            <Street>${data.po.ship.addr1}</Street>
                            <Street>${data.po.ship.addr2}</Street>
                            <City>${data.po.ship.city}</City>
                            <State>${data.po.ship.state}</State>
                            <PostalCode>${data.po.ship.zip}</PostalCode>
                            <Country isoCountryCode="US">United States</Country>
                        </PostalAddress>
                    </Address>
                </ShipTo>
                <BillTo>
                    <Address addressID="${data.po.bill.id}" isoCountryCode="US">
                        <Name xml:lang="en">${data.po.bill.company}</Name>
                        <PostalAddress name="default">
                            <Street>${data.po.bill.addr1}</Street>
                            <Street>${data.po.bill.addr2}</Street>
                            <City>${data.po.bill.city}</City>
                            <State>${data.po.bill.state}</State>
                            <PostalCode>${data.po.bill.zip}</PostalCode>
                            <Country isoCountryCode="US">United States</Country>
                        </PostalAddress>
                    </Address>
                </BillTo>
                <Comments>${data.po.memo}</Comments>
                <Extrinsic name="PO Number">${data.po.po_num}</Extrinsic>
            </OrderRequestHeader>
            <#list data.po.items>
                <#items as item>
            <ItemOut requestedDeliveryDate="${data.po.duedate}" lineNumber="${item.lineId}" quantity="${item.qty}">
                <ItemID>
                    <SupplierPartID>${item.supplierPartID}</SupplierPartID>
                </ItemID>
                <ItemDetail internalid="${item.itemId}">
                    <UnitPrice>
                        <Money currency="USD">${item.unit_price}</Money>
                    </UnitPrice>
                    <Description xml:lang="en">${item.purchasedescription}</Description>
                    <UnitOfMeasure>${item.purchaseunit}</UnitOfMeasure>
                    <ManufacturerPartID>${item.displayname}</ManufacturerPartID>
                    <ManufacturerName>${item.manufacturer}</ManufacturerName>
                    <LeadTime>${item.leadtime}</LeadTime>
                </ItemDetail>
                <#if item.tax?has_content>
                    <Tax>
                        <Money currency="USD">0.0000</Money>
                        <Description xml:lang="en" />
                    </Tax>
                </#if>
            </ItemOut>
                </#items>
            </#list>
        </OrderRequest>
    </Request>
</cXML>