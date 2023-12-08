# netsuite-celigo-integrator-everbright-12-04-23



Bundle 242998 = is the main code for netsuite -> project, customer, code. solarsuccess related



SuiteBundles > Bundle 389179  = blutraining
SuiteBundles > Bundle 352618  = saved_search_delete_records_MapReduceScript.js 
SuiteBundles > Bundle 482472  = saved_search_delete_records_MapReduceScript.js 

SuiteBundles > Bundle 286129 = password




This is scripts from NS

Enerflo has a flow Project Creation.

Need to complete for Everbright...

Neet to adjust code for everbright- celigo - flow

Project Interface Creation - v2 (v7->v2)
https://integrator.io/integrations/654e6568a34a1e27b19aa591/flowBuilder/656a61340c0dfb407b24bca7 

Google Drive - materials - resources - planning docs
https://drive.google.com/drive/folders/1ac-2jb4EBISM5Mke9oMld0MRaI42EoQb

[NS - TS] File Cabinet
https://8587733.app.netsuite.com/app/common/media/mediaitemfolders.nl?whence= 

[NS - TS] Customer to Project Mapping - Everbright Project Images
https://8587733.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=85&id=53&whence=

[NS - TS] Employee Everbright Integrator
https://8587733.app.netsuite.com/app/common/entity/employee.nl?id=68054&whence= 

[NS - TS] Customer to Project Mapping - EverBright Project ID
https://8587733.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=85&id=52

[NS - TS] Script Execution log 
https://8587733.app.netsuite.com/app/common/scripting/scriptnotearchive.nl?whence= 

[NS - TS] notion taskManager
https://www.notion.so/bded340199494f259c2719178af649b8?v=aefed1d9fd6c4c199acd79cb363d8d2d&p=667370344e3f4eeb9ede88f191348bff&pm=s 

[NS - TS] Hierarchy Object EverBright
https://goeverbright.atlassian.net/wiki/spaces/SS/pages/736854029/What+is+the+EverBright+Object+Hierarchy

Code Tasks - Added - NS - PIC script-> Project 
https://docs.google.com/document/d/1JzsePlhkapqtWgDkST0dcS3fl-CdcVbE-ioaw8NDgeQ 


Project Interface - https://8587733.app.netsuite.com/app/common/custom/custrecord.nl?id=88&e=T 

EverBright Project ID	custrecord_everbright_proj_id	Free-Form Text	 	EverBright	Yes
 	EverBright Project Images	custrecord_everbright_project_images	Rich Text	 	EverBright	No
 	Original Payload (EverBright)	custrecord_everbright_payload	Long Text	 	EverBright	No
 	Error Details (EverBright)	custrecord__everbright_details	Rich Text	 	EverBright	No


Customer to Project Mapping - https://8587733.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=85&id=52&whence= 
 
EverBright Project ID 

CUSTOMER FIELD ID
custentity_dev_everbright_project
PROJECT FIELD ID
custentity_dev_everbright_project


SolarSuccess Integration Configuration 
https://8587733.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=30&id=1 





EverBright Project ID	custentity_dev_everbright_project	custentity_dev_everbright_project
Everbright Project Images	custentity_everbright_proj_images	custentity_everbright_proj_images



customrecord_bb_project_adder
custrecord_bb_project_adder_project
custrecord_bb_adder_item
custrecord_bb_quantity


Custom Entity Field 

Everbright Customer ID	custentity_dev_everbright_customer_id	Free-Form Text	 	EverBright Integration
EverBright Project Id	custentity_dev_everbright_project_id	Free-Form Text	 	EverBright Integration

				~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   	
 Bundle 242998\BB SS\SS Lib\BB.SS.MD.LeadToProject.js

BB.SS.MD.LeadToProject.js

[function]  =>   function setProjectRelatedFields(project, entityObj)

	The provided code appears to be a JavaScript function called setProjectRelatedFields. This function is responsible for setting various fields on a project object based on the values present in an entityObj object. It seems to be part of a larger application or system where these objects are used, possibly within a NetSuite or SuiteScript context, given the references to custom fields and functions that are not defined in the provided code.
	
	Here's an explanation of what this code does step by step:
	
1	The function starts by logging a debug message with the project object passed to it.
2	It initializes a configOptions object, which is presumably used for configuration options.
3	Several custom fields on the project object are set based on corresponding fields in the entityObj object. These fields include financial and customer-related information.
4	The code checks if the configOptions.usesubs property is truthy. If it is, it sets the 'subsidiary' field on the project object based on the 'subsidiary' field in the entityObj object.
5	More fields related to financing and project expenses are set on the project object.
6	Depending on the value of configOptions.useAddressRecord, the code either creates a sub-customer record (address customer) using the addressRecord.createAddressCustomer function, or sets the entityObj.internalid as the parent of the project. In either case, the 'parent' field on the project object is set accordingly.
7	Various other fields related to project details and configuration are set on the project object.
8	The function appears to call a mapAdditionalCustomertoProjectFields function with the entityObj and project objects as arguments. This function is not defined in the provided code, so its purpose is unclear.
9	Finally, the function returns an object containing several properties derived from the entityObj, including 'templateId', 'entityId', 'proposalFileId', and 'utilityFileId'.

Overall, this code seems to be part of an integration between two systems or data objects, where information from the entityObj is mapped to fields on the project object, possibly within an enterprise resource planning (ERP) or similar context. To fully understand and use this code, you would need to have knowledge of the specific systems and customizations involved, including the definitions of custom fields, functions, and configurations mentioned in the code.


NetSuite Fields w/ Data Type
https://docs.google.com/spreadsheets/d/193cXHuvIt47EhCImcUH-DHYbeH8WAgL6oYr_v4Etd84

originalPayload.contactData
originalPayload.projectData
originalPayload.files
originalPayload.agreement_url
originalPayload.v2DealData.objArrays[*]


getFinancierId(projectData.advPaySch.lenderName)  = getFinancierId(name)  =  'Cash'


				~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   	

originalPayload.addersData  


originalPayload.batteriesData  


originalPayload.arraysData 


				~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   	



originalPayload.projectData.salesRep



