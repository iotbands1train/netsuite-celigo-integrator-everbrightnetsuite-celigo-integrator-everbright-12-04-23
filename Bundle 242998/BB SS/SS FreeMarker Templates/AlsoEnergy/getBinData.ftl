<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:als="alsoenergy_ns" xmlns:als1="http://schemas.datacontract.org/2004/07/AlsoEnergyAPI.Data">
   <soapenv:Header/>
   <soapenv:Body>
      <als:GetBinData>
         <!--Optional:-->
         <als:sessionID>${data.session}</als:sessionID>
         <!--Optional:-->
         <als:fromLocal>${data.startdate}</als:fromLocal>
         <!--Optional:-->
         <als:toLocal>${data.enddate}</als:toLocal>
         <!--Optional:-->
         <als:binSize>${data.interval}</als:binSize>
         <!--Optional:-->
         <als:Fields>
            <!--Zero or more repetitions:-->
            ${data.dataFields}
          </als:Fields>
      </als:GetBinData>
   </soapenv:Body>
</soapenv:Envelope>