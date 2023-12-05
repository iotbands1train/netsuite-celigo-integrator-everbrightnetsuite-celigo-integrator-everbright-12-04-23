<style>#payment-memo{border-collapse:collapse;}#payment-memo td{padding-right: 20px; padding-bottom: 2px; font-size: 12px}.bb-currency{text-align: right;}.bb-total{font-weight: bold;}#payment-memo tr.bb-total td{padding-top:7px}</style>
<table id="payment-memo" class="payment-memo">
   <tbody>
      <#if project.custentity_bb_fin_prelim_purch_price_amt.value?number!=0> 
      <tr>
         <td>${record.custentity_bb_fin_prelim_purch_price_amt@label}</td>
         <td></td>
         <td></td>
         <td class="bb-currency">${project.custentity_bb_fin_prelim_purch_price_amt.value?number?string.currency}</td>
      </tr>
      </#if> <#if project.custentity_bb_fin_owned_equip_costs_amt.value?number!=0> 
      <tr>
         <td>${record.custentity_bb_fin_owned_equip_costs_amt@label}</td>
         <td></td>
         <td></td>
         <td class="bb-currency">${project.custentity_bb_fin_owned_equip_costs_amt.value?number?string.currency}</td>
      </tr>
      </#if> <#if project.custentity_bb_total_contract_value_amt.value?number!=0> 
      <tr class="bb-total">
         <td>${record.custentity_bb_total_contract_value_amt@label}</td>
         <td></td>
         <td></td>
         <td class="bb-currency">${project.custentity_bb_total_contract_value_amt.value?number?string.currency}</td>
      </tr>
      <tr>
         <td>&nbsp;</td>
         <td></td>
         <td></td>
         <td></td>
      </tr>
      </#if> <#if project.custentity_bb_fin_base_fees_amount.value?number!=0> 
      <tr>
         <td>${record.custentity_bb_fin_base_fees_amount@label}</td>
         <td></td>
         <td></td>
         <td class="bb-currency">${project.custentity_bb_fin_base_fees_amount.value?number?string.currency}</td>
      </tr>
      </#if> <#if project.custentity_bb_fin_monitoring_fee_amount.value?number!=0> 
      <tr>
         <td>${record.custentity_bb_fin_monitoring_fee_amount@label}</td>
         <td></td>
         <td></td>
         <td class="bb-currency">${project.custentity_bb_fin_monitoring_fee_amount.value?number?string.currency}</td>
      </tr>
      </#if> <#if project.custentity_bb_fin_total_fees_amount.value?number!=0> 
      <tr class="bb-total">
         <td>${record.custentity_bb_fin_total_fees_amount@label}</td>
         <td></td>
         <td></td>
         <td class="bb-currency">${project.custentity_bb_fin_total_fees_amount.value?number?string.currency}</td>
      </tr>
      <tr>
         <td>&nbsp;</td>
         <td></td>
         <td></td>
         <td></td>
      </tr>
      </#if> <#if project.custentity_bb_fin_total_invoice_amount.value?number!=0> 
      <tr class="bb-total">
         <td>${record.custentity_bb_fin_total_invoice_amount@label}</td>
         <td></td>
         <td></td>
         <td class="bb-currency">${project.custentity_bb_fin_total_invoice_amount.value?number?string.currency}</td>
      </tr>
      </#if> <#if project.custentity_bb_fin_m0_invoice_amount.value?number!=0> 
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
      </#if> <#if project.custentity_bb_fin_m1_invoice_amount.value?number!=0> 
      <tr>
         <td>M1</td>
         <td></td>
         <td></td>
         <td class="bb-currency">${project.custentity_bb_fin_m1_invoice_amount.value?number?string.currency}</td>
      </tr>
      </#if> <#if project.custentity_bb_fin_m2_invoice_amount.value?number!=0> 
      <tr>
         <td>M2</td>
         <td></td>
         <td></td>
         <td class="bb-currency">${project.custentity_bb_fin_m2_invoice_amount.value?number?string.currency}</td>
      </tr>
      </#if> <#if project.custentity_bb_fin_m3_invoice_amount.value?number!=0> 
      <tr>
         <td>M3</td>
         <td></td>
         <td></td>
         <td class="bb-currency">${project.custentity_bb_fin_m3_invoice_amount.value?number?string.currency}</td>
      </tr>
      </#if> <#if project.custentity_bb_fin_m4_invoice_amount.value?number!=0> 
      <tr>
         <td>M4</td>
         <td></td>
         <td></td>
         <td class="bb-currency">${project.custentity_bb_fin_m4_invoice_amount.value?number?string.currency}</td>
      </tr>
      </#if> <#if project.custentity_bb_fin_m5_invoice_amount.value?number!=0> 
      <tr>
         <td>M5</td>
         <td></td>
         <td></td>
         <td class="bb-currency">${project.custentity_bb_fin_m5_invoice_amount.value?number?string.currency}</td>
      </tr>
      </#if> <#if project.custentity_bb_fin_m6_invoice_amount.value?number!=0> 
      <tr>
         <td>M6</td>
         <td></td>
         <td></td>
         <td class="bb-currency">${project.custentity_bb_fin_m6_invoice_amount.value?number?string.currency}</td>
      </tr>
      </#if> <#if project.custentity_bb_fin_m7_invoice_amount.value?number!=0> 
      <tr>
         <td>M7</td>
         <td></td>
         <td></td>
         <td class="bb-currency">${project.custentity_bb_fin_m7_invoice_amount.value?number?string.currency}</td>
      </tr>
      </#if> <#if (project.custentity_bb_fin_m0_invoice_amount.value?number + project.custentity_bb_fin_m1_invoice_amount.value?number + project.custentity_bb_fin_m2_invoice_amount.value?number + project.custentity_bb_fin_m3_invoice_amount.value?number + project.custentity_bb_fin_m4_invoice_amount.value?number + project.custentity_bb_fin_m5_invoice_amount.value?number + project.custentity_bb_fin_m6_invoice_amount.value?number + project.custentity_bb_fin_m7_invoice_amount.value?number)!=0> 
      <tr class="bb-total">
         <td>${record.custentity_bb_orgntr_payment_tot_amt@label}</td>
         <td></td>
         <td></td>
         <td class="bb-currency">${(project.custentity_bb_fin_m0_invoice_amount.value?number + project.custentity_bb_fin_m1_invoice_amount.value?number + project.custentity_bb_fin_m2_invoice_amount.value?number + project.custentity_bb_fin_m3_invoice_amount.value?number + project.custentity_bb_fin_m4_invoice_amount.value?number + project.custentity_bb_fin_m5_invoice_amount.value?number + project.custentity_bb_fin_m6_invoice_amount.value?number + project.custentity_bb_fin_m7_invoice_amount.value?number)?string.currency}</td>
      </tr>
      </#if>
   </tbody>
</table>