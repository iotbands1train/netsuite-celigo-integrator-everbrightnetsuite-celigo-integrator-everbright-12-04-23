<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:als="alsoenergy_ns">
   <soapenv:Header/>
   <soapenv:Body>
      <als:Logout>
         <!--Optional:-->
         <als:sessionID>${data.id}</als:sessionID>
      </als:Logout>
   </soapenv:Body>
</soapenv:Envelope>