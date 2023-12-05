<br/><span style="font-size: 12px; font-family: Arial, Helvetica, sans-serif; color:grey">RESULTS</span>
<div style="font-size: 12px; font-family: Arial, Helvetica, sans-serif; border:1px solid lightgrey; border-radius: 5px;padding: 5px;">
  <#if data.netIncrease30?number gt 0>
  <p>0-30 Day Operating Cash <span style="color: darkgreen; font-weight:bold">increased</span> by ${data.netIncrease30?number?string.currency}.
  <#elseif data.netIncrease30?number lt 0>
  <p>0-30 Day Operating Cash <span style="color: red; font-weight:bold">decreased</span> by ${(data.netIncrease30?number*-1)?string.currency}.
  <#else>
  <p>0-30 Day Operating Cash did not change.
  </#if>

  <#if data.netIncrease60?number gt 0>
  <br/>31-60 Day Operating Cash <span style="color: darkgreen; font-weight:bold">increased</span> by ${data.netIncrease60?number?string.currency}.
  <#elseif data.netIncrease60?number lt 0>
  <br/>31-60 Day Operating Cash <span style="color: red; font-weight:bold">decreased</span> by ${(data.netIncrease60?number*-1)?string.currency}.</p>
  <#else>
  <br/>31-60 Day Operating Cash did not change.
  </#if>

  <#if data.netIncrease90?number gt 0>
  <br/>61-90 Day Operating Cash <span style="color: darkgreen; font-weight:bold">increased</span> by ${data.netIncrease90?number?string.currency}.
  <#elseif data.netIncrease90?number lt 0>
  <br/>61-90 Day Operating Cash <span style="color: red; font-weight:bold">decreased</span> by ${(data.netIncrease90?number*-1)?string.currency}.</p>
  <#else>
  <br/>61-90 Day Operating Cash did not change.
  </#if>
  <br/><br/>

  <p>There are ${data.numProjects?number?string} open projects with 
     ${data.remainingRevenue?number?string.currency} in remaining revenue, and 
     ${data.remainingExpenses?number?string.currency} in expenses.</p>
  <br/>
  <p>There are ${data.newCount?number?string} new projects with 
     ${data.newRemaining?number?string.currency} remaining.
  <br/>There are ${data.m0Count?number?string} M0 projects with 
     ${data.m0Remaining?number?string.currency} remaining.
  <br/>There are ${data.m1Count?number?string} M1 projects with 
     ${data.m1Remaining?number?string.currency} remaining.
  <br/>There are ${data.m2Count?number?string} M2 projects with 
     ${data.m2Remaining?number?string.currency} remaining.</p>
  <br/>
  <p>The oldest project is ${data.minStartDate?number?string} days old and the newest is 
    ${data.maxStartDate?number?string}.</p>
</div>