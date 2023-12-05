<style>
 #payment-memo {
     border-collapse:collapse;
 }
 #payment-memo td {
     padding-right: 20px;
     padding-bottom: 2px;
     font-size: 12px
 }
 .bb-currency {
    text-align: right;
}
 .bb-total {
     font-weight: bold;
 }
#payment-memo tr.bb-total td {
   padding-top:7px
}
</style>
<#macro header>
    <tr class="bb-total">
        <td></td>
        <td class="bb-currency">Rate</td>
        <td class="bb-currency">Qty</td>
        <td class="bb-currency">Ext. Price</td>
    <tr>
</#macro>
<#macro cells adderItem>
     <td>${adderItem.custrecord_bb_adder_item}</td>
     <td class="bb-currency">${adderItem.custrecord_bb_adder_price_amt}</td>
     <td class="bb-currency">${adderItem.custrecord_bb_quantity}</td>
     <td class="bb-currency">${adderItem.custrecord_bb_adder_total_amount}</td>
</#macro>
<table id="payment-memo" class="payment-memo"><tbody>
    
    <#if project.custentity_bb_system_size_decimal.value?number!=0>
    <tr>
        <td>System Size (Watts)</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${project.custentity_bb_system_size_decimal.value?number * 1000}</td>
    </tr>
    </#if>


    <#if project.custentity_bb_fin_install_per_watt_amt.value?number!=0>
    <tr>
        <td>Price/Watt</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${project.custentity_bb_fin_install_per_watt_amt.value?number?string.currency}</td>
    </tr>
    </#if>


    <#if project.custentity_bb_fin_install_base_amt.value?number!=0>
    <tr class="bb-total">
        <td>Base Amount</td>
        <td>${project.custentity_bb_fin_install_per_watt_amt.value?number?string.currency}</td>
        <td>${project.custentity_bb_system_size_decimal.value?number * 1000}</td>
        <td class="bb-currency">${project.custentity_bb_fin_install_base_amt.value?number?string.currency}</td>
    </tr>
    </#if>

    <#if project.installFixedAdders?size != 0 || project.installPerWattAdders?size != 0 || project.installPerFootAdders?size != 0 || project.installPerModAdders?size != 0 >
        <!-- header & first row -->
        <@header/>
    </#if>
    
    <#list project.installFixedAdders as adder>
        
        <#if adder_has_next>
            <tr>
                <@cells adderItem=adder/>
            </tr>
        <#else>
            <tr>
                <@cells adderItem=adder/>
            </tr>
            <tr class="bb-total">
                <td>Fixed Adder Total</td>
                <td></td>
                <td></td>
                <td class="bb-currency">${project.custentity_bb_fin_fixed_adder_amt.value?number?string.currency}</td>
            </tr>
        </#if>
    </#list>

    <#list project.installPerModAdders as adder>
        <#if adder_has_next>
            <tr>
                <@cells adderItem=adder/>
            </tr>
        <#else>
            <tr>
                <@cells adderItem=adder/>
            </tr>
            <tr class="bb-total">
                <td>Per Module Adder Total</td>
                <td></td>
                <td></td>
                <td class="bb-currency">${project.custentity_bb_fin_per_module_adder_amt.value?number?string.currency}</td>
            </tr>
        </#if>
    </#list>

    <#list project.installPerWattAdders as adder>
        <#if adder_has_next>
            <tr>
                <@cells adderItem=adder/>
            </tr>
        <#else>
            <tr>
                <@cells adderItem=adder/>
            </tr>
            <tr class="bb-total">
                <td>Per Watt Adder Total</td>
                <td></td>
                <td></td>
                <td class="bb-currency">${project.custentity_bb_fin_per_watt_adder_amt.value?number?string.currency}</td>
            </tr>
        </#if>
    </#list>

    <#list project.installPerFootAdders as adder>
        <#if adder_has_next>
            <tr>
                <@cells adderItem=adder/>
            </tr>
        <#else>
            <tr>
                <@cells adderItem=adder/>
            </tr>
            <tr class="bb-total">
                <td>Per Foot Adder Total</td>
                <td></td>
                <td></td>
                <td class="bb-currency">${project.custentity_bb_fin_per_foot_adder_amt.value?number?string.currency}</td>
            </tr>
        </#if>
    </#list>

    <#if project.custentity_bb_total_contract_value_amt.value?number!=0>
    <tr>
        <td>&nbsp;</td>
        <td></td>
        <td></td>
        <td></td>
    </tr>
    <tr class="bb-total">
        <td>Total Contract Value</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${project.custentity_bb_total_contract_value_amt.value?number?string.currency}</td>
    </tr>
    </#if>

    <#if project.custentity_bb_fin_m0_invoice_amount.value?number!=0>
    <tr>
        <td>&nbsp;</td>
        <td></td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td>M0</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${project.custentity_bb_fin_m0_invoice_amount.value?number?string.currency}</td>
    </tr>
    </#if>

    <#if project.custentity_bb_fin_m1_invoice_amount.value?number!=0>
    <tr>
        <td>M1</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${project.custentity_bb_fin_m1_invoice_amount.value?number?string.currency}</td>
    </tr>
    </#if>

    <#if project.custentity_bb_fin_m2_invoice_amount.value?number!=0>
    <tr>
        <td>M2</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${project.custentity_bb_fin_m2_invoice_amount.value?number?string.currency}</td>
    </tr>
    </#if>

    <#if project.custentity_bb_fin_m3_invoice_amount.value?number!=0>
    <tr>
        <td>M3</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${project.custentity_bb_fin_m3_invoice_amount.value?number?string.currency}</td>
    </tr>
    </#if>

    <!--</#if> -->

    <#if project.custentity_bb_fin_m4_invoice_amount.value?number!=0>
    <tr>
        <td>&nbsp;</td>
        <td></td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td>M4</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${project.custentity_bb_fin_m4_invoice_amount.value?number?string.currency}</td>
    </tr>
    </#if>

    <#if project.custentity_bb_fin_m5_invoice_amount.value?number!=0>
    <tr>
        <td>M5</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${project.custentity_bb_fin_m5_invoice_amount.value?number?string.currency}</td>
    </tr>
    </#if>

    <#if project.custentity_bb_fin_m6_invoice_amount.value?number!=0>
    <tr>
        <td>M6</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${project.custentity_bb_fin_m6_invoice_amount.value?number?string.currency}</td>
    </tr>

    </#if>

    <#if project.custentity_bb_fin_7_invoice_amount.value?number!=0>
    <tr>
        <td>M7</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${project.custentity_bb_fin_m7_invoice_amount.value?number?string.currency}</td>
    </tr>
    </#if>


    <#if (project.custentity_bb_fin_m0_invoice_amount.value?number + project.custentity_bb_fin_m1_invoice_amount.value?number + project.custentity_bb_fin_m2_invoice_amount.value?number + project.custentity_bb_fin_m3_invoice_amount.value?number + project.custentity_bb_fin_m4_invoice_amount.value?number + project.custentity_bb_fin_m5_invoice_amount.value?number + project.custentity_bb_fin_m6_invoice_amount.value?number + project.custentity_bb_fin_m7_invoice_amount.value?number)!=0>
    <tr class="bb-total">
        <td>Total Paid</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${(project.custentity_bb_fin_m0_invoice_amount.value?number + project.custentity_bb_fin_m1_invoice_amount.value?number + project.custentity_bb_fin_m2_invoice_amount.value?number + project.custentity_bb_fin_m3_invoice_amount.value?number + project.custentity_bb_fin_m4_invoice_amount.value?number + project.custentity_bb_fin_m5_invoice_amount.value?number + project.custentity_bb_fin_m6_invoice_amount.value?number + project.custentity_bb_fin_m7_invoice_amount.value?number)?string.currency}</td>
    </tr>
    </#if>
</tbody></table>
