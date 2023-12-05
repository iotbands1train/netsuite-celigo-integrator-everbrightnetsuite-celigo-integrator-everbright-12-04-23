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
    <tr>
        <td>&nbsp;</td>   
        <td></td>
        <td></td>
        <td></td>
        <td><b></b></td>
    </tr>

    <#if project.custentity_bb_system_size_decimal.value?number!=0>
    <tr>
        <td>${record.custentity_bb_system_size_decimal@label}</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${project.custentity_bb_system_size_decimal.value?number * 1000}</td>
        <td></td>
    </tr>
    </#if>

    <tr>
        <td>&nbsp;</td>   
        <td></td>
        <td></td>
        <td></td>
        <td><b>Per Watt</b></td>
    </tr>

    <#if project.custentity_bb_fin_prelim_purch_price_amt.value?number!=0>
    <tr>
        <td>${record.custentity_bb_fin_prelim_purch_price_amt@label}</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${project.custentity_bb_fin_prelim_purch_price_amt.value?number?string.currency}</td>
        <td class="bb-currency">${project.custentity_bb_fin_pur_price_p_watt_amt.value?number?string.currency}</td>
    </tr>
    </#if>


    <tr>
        <td>&nbsp;</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
    </tr>
<!--
    <#if project.custentity_bb_fin_pur_price_p_watt_amt.value?number!=0>
    <tr>
        <td>${record.custentity_bb_fin_pur_price_p_watt_amt@label}</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${project.custentity_bb_fin_pur_price_p_watt_amt.value?number?string.currency}</td>
        <td></td>
    </tr>
    </#if>
-->

    <#if project.custentity_bb_originator_base_p_watt_amt.value?number!=0>
    <tr>
        <td>${record.custentity_bb_originator_base_p_watt_amt@label}</td>
        <td></td>
        <td></td>
        <td></td>
        <td class="bb-currency">${project.custentity_bb_originator_base_p_watt_amt.value?number?string.currency}</td>
        
    </tr>
    </#if>

    <tr>
        <td>&nbsp;</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
    </tr>
<!--
    <#if project.custentity_bb_originator_per_watt_amt.value?number!=0>
    <tr>
        <td>${record.custentity_bb_originator_per_watt_amt@label}</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${project.custentity_bb_originator_per_watt_amt.value?number?string.currency}</td>
        <td></td>
    </tr>
    </#if>
-->

    <#if project.custentity_bb_originator_base_amt.value?number!=0>
<!--
    <tr>
        <td>&nbsp;</td>   
        <td></td>
        <td></td>
        <td></td>
        <td><b>Per Watt</b></td>
    </tr>
-->
    <tr>
        <td><b>${record.custentity_bb_originator_base_amt@label}</b></td>
        <td></td>
        <td><b>${project.custentity_bb_system_size_decimal.value?number*1000}</b></td>
        <td class="bb-currency"><b>${project.custentity_bb_originator_base_amt.value?number?string.currency}</b></td>
        <td class="bb-currency"><b>${project.custentity_bb_originator_per_watt_amt.value?number?string.currency}</b></td>
        
    </tr>
    </#if>

    
    <#if project.origFixedAdders?size != 0 || project.origPerWattAdders?size != 0 || project.origPerFootAdders?size != 0 || project.origPerModAdders?size != 0 >
        <!-- header & first row -->
        <@header/>
    </#if>

    <#list project.origFixedAdders as adder>
        <#if adder_has_next>
            <tr>
                <@cells adderItem=adder/>
            </tr>
        <#else>
            <tr>
                <@cells adderItem=adder/>
            </tr>
            <tr class="bb-total">
                <td>${record.custentity_bb_orgntr_fxd_addr_ttl_amt@label}</td>
                <td></td>
                <td></td>
                <td class="bb-currency">${project.custentity_bb_orgntr_fxd_addr_ttl_amt.value?number?string.currency}</td>
                <td></td>
            </tr>
        </#if>
    </#list>
    <#list project.origPerModAdders as adder>
        <#if adder_has_next>
            <tr>
                <@cells adderItem=adder/>
            </tr>
        <#else>
            <tr>
                <@cells adderItem=adder/>
            </tr>
            <tr class="bb-total">
                <td>${record.custentity_bb_orgntr_per_mod_adder_amt@label}</td>
                <td></td>
                <td></td>
                <td class="bb-currency">${project.custentity_bb_orgntr_per_mod_adder_amt.value?number?string.currency}</td>
                <td></td>
            </tr>
        </#if>
    </#list>
    <#list project.origPerWattAdders as adder>
        <#if adder_has_next>
            <tr>
                <@cells adderItem=adder/>
            </tr>
        <#else>
            <tr>
                <@cells adderItem=adder/>
            </tr>
            <tr class="bb-total">
                <td>${record.custentity_bb_orgntr_per_watt_adder_amt@label}</td>
                <td></td>
                <td></td>
                <td class="bb-currency">${project.custentity_bb_orgntr_per_watt_adder_amt.value?number?string.currency}</td>
                <td></td>
            </tr>
        </#if>
    </#list>
    <#list project.origPerFootAdders as adder>
        <#if adder_has_next>
            <tr>
                <@cells adderItem=adder/>
            </tr>
        <#else>
            <tr>
                <@cells adderItem=adder/>
            </tr>
            <tr class="bb-total">
                <td>${record.custentity_bb_orgntr_per_ft_addr_ttl_amt@label}</td>
                <td></td>
                <td></td>
                <td class="bb-currency">${project.custentity_bb_orgntr_per_ft_addr_ttl_amt.value?number?string.currency}</td>
                <td></td>
            </tr>
        </#if>
    </#list>

    <tr>
        <td>&nbsp;</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
    </tr>

<!--
    <#if project.custentity_bb_originator_base_amt.value?number!=0 && project.custentity_bb_orgntr_addr_ttl_amt.value?number!=0>
    <tr class="bb-total">
        <td>Total Contract Value</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${(project.custentity_bb_originator_base_amt.value?number - project.custentity_bb_orgntr_addr_ttl_amt.value?number)?string.currency}</td>
        <td></td>
    </tr>
    </#if>
-->
    <tr>
        <td>&nbsp;</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
    </tr>


    <#if project.custentity_bb_orgntr_m0_vbill_amt.value?number!=0>
    <tr>
        <td>M0</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${project.custentity_bb_orgntr_m0_vbill_amt.value?number?string.currency}</td>
        <td></td>
    </tr>
    </#if>
    <#if project.custentity_bb_orgntr_m1_vbill_amt.value?number!=0>
    <tr>
        <td>M1</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${project.custentity_bb_orgntr_m1_vbill_amt.value?number?string.currency}</td>
        <td></td>
    </tr>
    </#if>
    <#if project.custentity_bb_orgntr_m2_vbill_amt.value?number!=0>
    <tr>
        <td>M2</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${project.custentity_bb_orgntr_m2_vbill_amt.value?number?string.currency}</td>
        <td></td>
    </tr>
    </#if>
    <#if project.custentity_bb_orgntr_m3_vbill_amt.value?number!=0>
    <tr>
        <td>M3</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${project.custentity_bb_orgntr_m3_vbill_amt.value?number?string.currency}</td>
        <td></td>
    </tr>
    </#if>


    <#if project.custentity_bb_orgntr_m4_vbill_amt.value?number!=0>
    <tr>
        <td>M4</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${project.custentity_bb_orgntr_m4_vbill_amt.value?number?string.currency}</td>
        <td></td>
    </tr>
    </#if>

    <#if project.custentity_bb_orgntr_m5_vbill_amt.value?number!=0>
    <tr>
        <td>M5</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${project.custentity_bb_orgntr_m5_vbill_amt.value?number?string.currency}</td>
        <td></td>
    </tr>
    </#if>

    <#if project.custentity_bb_orgntr_m6_vbill_amt.value?number!=0>
    <tr>
        <td>M6</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${project.custentity_bb_orgntr_m6_vbill_amt.value?number?string.currency}</td>
        <td></td>
    </tr>
    </#if>

    <#if project.custentity_bb_orgntr_m7_vbill_amt.value?number!=0>
    <tr>
        <td>M7</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${project.custentity_bb_orgntr_m7_vbill_amt.value?number?string.currency}</td>
        <td></td>
    </tr>
    </#if>

    <#if project.custentity_bb_originator_base_amt.value?number!=0 && project.custentity_bb_orgntr_addr_ttl_amt.value?number!=0>
    <tr class="bb-total">
        <td>Total Contract Value</td>
        <td></td>
        <td></td>
        <td class="bb-currency">${(project.custentity_bb_originator_base_amt.value?number - project.custentity_bb_orgntr_addr_ttl_amt.value?number)?string.currency}</td>
        <td></td>
    </tr>
    </#if>
</tbody></table>




