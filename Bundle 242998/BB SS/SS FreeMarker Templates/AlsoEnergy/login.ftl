<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:als="alsoenergy_ns">
   <soapenv:Header/>
   <soapenv:Body>
      <als:Login>
         <als:username>${data.credentials.username}</als:username>
         <als:password>${data.credentials.password}</als:password>
      </als:Login>
   </soapenv:Body>
</soapenv:Envelope>