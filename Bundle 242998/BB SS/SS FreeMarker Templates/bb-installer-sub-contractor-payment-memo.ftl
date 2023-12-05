<style>#payment-memo{border-collapse:collapse;}#payment-memo td{padding-right: 20px; padding-bottom: 2px; font-size: 12px}.bb-currency{text-align: right;}.bb-total{font-weight: bold;}#payment-memo tr.bb-total td{padding-top:7px}</style>
<#macro header> 
<tr class="bb-total">
   <td></td>
   <td class="bb-currency">Rate</td>
   <td class="bb-currency">Qty</td>
   <td class="bb-currency">Ext. Price</td>
<tr>
   </#macro><#macro cells adderItem> 
   <td>${adderItem.custrecord_bb_adder_item}</td>
   <td class="bb-currency">${adderItem.custrecord_bb_adder_price_amt}</td>
   <td class="bb-currency">${adderItem.custrecord_bb_quantity}</td>
   <td class="bb-currency">${adderItem.custrecord_bb_adder_total_amount}</td>
   </#macro>
   <table id="payment-memo" class="payment-memo">
      <tbody>
         <tr>
            <td>&nbsp;</td>
            <td></td>
            <td></td>
         </tr>
         <#if project.custentity_bb_system_size_decimal.value?number!=0> 
         <tr>
            <td>${record.custentity_bb_system_size_decimal@label}</td>
            <td></td>
            <td class="bb-currency">${project.custentity_bb_system_size_decimal.value?number * 1000}</td>
         </tr>
         </#if> 
         <tr>
            <td>&nbsp;</td>
            <td></td>
            <td></td>
            <td class="bb-currency"><b>Per Watt</b></td>
         </tr>
         <#if project.custentity_bb_installer_amt.value?number!=0> 
         <tr>
            <td>${record.custentity_bb_installer_amt@label}</td>
            <td></td>
            <td class="bb-currency">${project.custentity_bb_installer_amt.value?number?string.currency}</td>
            <td class="bb-currency">${project.custentity_bb_installer_price_p_w.value?number?string.currency}</td>
         </tr>
         </#if> <#if project.installFixedAdders?size !=0 || project.installPerWattAdders?size !=0 || project.intallPerFootAdders?size !=0 || project.installPerModAdders?size !=0 > <@header/> </#if> <#list project.installFixedAdders as adder> <#if adder_has_next> 
         <tr> <@cells adderItem=adder/> </tr>
         <#else> 
         <tr> <@cells adderItem=adder/> </tr>
         <tr class="bb-total">
            <td>${record.custentity_bb_installer_fxd_addr_ttl_amt@label}</td>
            <td></td>
            <td></td>
            <td class="bb-currency">${project.custentity_bb_installer_fxd_addr_ttl_amt.value?number?string.currency}</td>
            <td></td>
         </tr>
         </#if> </#list> <#list project.installPerModAdders as adder> <#if adder_has_next> 
         <tr> <@cells adderItem=adder/> </tr>
         <#else> 
         <tr> <@cells adderItem=adder/> </tr>
         <tr class="bb-total">
            <td>${record.custentity_bb_instllr_pr_md_addr_ttl_amt@label}</td>
            <td></td>
            <td></td>
            <td class="bb-currency">${project.custentity_bb_instllr_pr_md_addr_ttl_amt.value?number?string.currency}</td>
            <td></td>
         </tr>
         </#if> </#list> <#list project.installPerWattAdders as adder> <#if adder_has_next> 
         <tr> <@cells adderItem=adder/> </tr>
         <#else> 
         <tr> <@cells adderItem=adder/> </tr>
         <tr class="bb-total">
            <td>${record.custentity_bb_instllr_pr_wt_addr_ttl_amt@label}</td>
            <td></td>
            <td></td>
            <td class="bb-currency">${project.custentity_bb_instllr_pr_wt_addr_ttl_amt.value?number?string.currency}</td>
            <td></td>
         </tr>
         </#if> </#list> <#list project.intallPerFootAdders as adder> <#if adder_has_next> 
         <tr> <@cells adderItem=adder/> </tr>
         <#else> 
         <tr> <@cells adderItem=adder/> </tr>
         <tr class="bb-total">
            <td>${record.custentity_bb_installr_p_ft_addr_ttl_amt@label}</td>
            <td></td>
            <td></td>
            <td class="bb-currency">${project.custentity_bb_installr_p_ft_addr_ttl_amt.value?number?string.currency}</td>
            <td></td>
         </tr>
         </#if> </#list> 
         <tr>
            <td>&nbsp;</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
         </tr>
         <#if project.custentity_bb_installer_amt?number!=0 && project.custentity_bb_installer_adder_total_amt.value?number!=0> 
         <tr class="bb-total">
            <td>${record.custentity_bb_total_contract_value_amt@label}</td>
            <td></td>
            <td></td>
            <td class="bb-currency">${(project.custentity_bb_installer_amt.value?number - project.custentity_bb_installer_adder_total_amt.value?number)?string.currency}</td>
            <td></td>
         </tr>
         </#if> 
         <tr>
            <td>&nbsp;</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
         </tr>
         <#if project.custentity_bb_installer_m0_vbill_amt.value?number!=0> 
         <tr>
            <td>M0</td>
            <td></td>
            <td></td>
            <td class="bb-currency">${project.custentity_bb_installer_m0_vbill_amt.value?number?string.currency}</td>
            <td></td>
         </tr>
         </#if> <#if project.custentity_bb_installer_m1_vbill_amt.value?number!=0> 
         <tr>
            <td>M1</td>
            <td></td>
            <td></td>
            <td class="bb-currency">${project.custentity_bb_installer_m1_vbill_amt.value?number?string.currency}</td>
            <td></td>
         </tr>
         </#if> <#if project.custentity_bb_installer_m2_vbill_amt.value?number!=0> 
         <tr>
            <td>M2</td>
            <td></td>
            <td></td>
            <td class="bb-currency">${project.custentity_bb_installer_m2_vbill_amt.value?number?string.currency}</td>
            <td></td>
         </tr>
         </#if> <#if project.custentity_bb_installer_m3_vbill_amt.value?number!=0> 
         <tr>
            <td>M3</td>
            <td></td>
            <td></td>
            <td class="bb-currency">${project.custentity_bb_installer_m3_vbill_amt.value?number?string.currency}</td>
            <td></td>
         </tr>
         </#if> <#if project.custentity_bb_installer_m4_vbill_amt.value?number!=0> 
         <tr>
            <td>M4</td>
            <td></td>
            <td></td>
            <td class="bb-currency">${project.custentity_bb_installer_m4_vbill_amt.value?number?string.currency}</td>
            <td></td>
         </tr>
         </#if> <#if project.custentity_bb_installer_m5_vbill_amt.value?number!=0> 
         <tr>
            <td>M5</td>
            <td></td>
            <td></td>
            <td class="bb-currency">${project.custentity_bb_installer_m5_vbill_amt.value?number?string.currency}</td>
            <td></td>
         </tr>
         </#if> <#if project.custentity_bb_installer_m6_vbill_amt.value?number!=0> 
         <tr>
            <td>M6</td>
            <td></td>
            <td></td>
            <td class="bb-currency">${project.custentity_bb_installer_m6_vbill_amt.value?number?string.currency}</td>
            <td></td>
         </tr>
         </#if> <#if project.custentity_bb_installer_m7_vbill_amt.value?number!=0> 
         <tr>
            <td>M7</td>
            <td></td>
            <td></td>
            <td class="bb-currency">${project.custentity_bb_installer_m7_vbill_amt.value?number?string.currency}</td>
            <td></td>
         </tr>
         </#if> <#if project.custentity_bb_installer_vbill_ttl_amt.value?number!=0> 
         <tr class="bb-total">
            <td>${record.custentity_bb_installer_vbill_ttl_amt@label}</td>
            <td></td>
            <td></td>
            <td class="bb-currency">${project.custentity_bb_installer_vbill_ttl_amt.value?number?string.currency}</td>
            <td></td>
         </tr>
         </#if>
      </tbody>
   </table>