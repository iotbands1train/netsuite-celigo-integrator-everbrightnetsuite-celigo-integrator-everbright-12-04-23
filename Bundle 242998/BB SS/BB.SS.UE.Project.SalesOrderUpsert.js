/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig ./bb-libraries-v2.json
 * @author Brendan Boyd
 * @version 0.2.0
 * @fileOverview This user event script updates Sales Orders associated with the Project.
 */
define(['N/record', 'N/search', 'BB/project', 'BB/transaction', 'BB/entity'],

       function(record, search, project, transaction, entity) {
           /**
            * Function definition to be triggered before record is loaded.
            *
            * @param {Object} scriptContext
            * @param {Record} scriptContext.newRecord - New record
            * @param {Record} scriptContext.oldRecord - Old record
            * @param {string} scriptContext.type - Trigger type
            * @Since 2015.2
            */
           function afterSubmit(scriptContext) {
               try{
                   var trigger = scriptContext.type;
                   if(trigger == 'edit'){
                       var projectReference = BB.SS.Projects.Job;
                       var newProject = new projectReference(scriptContext.newRecord);
                       var salesOrder = new BB.SS.Transactions.Salesorder({internalId: newProject.projectSo});
                       salesOrder.load();
                       salesOrder.shipdate = newProject.requestedDeliveryDate;
                       salesOrder.liftgateReqdCheckbox = newProject.hasLiftGateBool.toBool();
                       salesOrder.resiDeliveryCheckbox = newProject.isResDeliveryBool.toBool();
                       salesOrder.requireCallAhead = newProject.requireCallAhead.toBool();
                       salesOrder.callAheadPhone = newProject.callAheadPhone;
                           // salesOrder.location = newProject.jobType == EPC ? PROJECT_SITE_EPC_OWNED : EPC_OWNED;

                       salesOrder.shippingAddress.country = 'US';
                       salesOrder.shippingAddress.attention = 'Installation Address';
                       salesOrder.shippingAddress.addressee = newProject.homeOwnerNameText;
                       salesOrder.shippingAddress.addrphone = newProject.homeOwnderPhone;
                       salesOrder.shippingAddress.addressLine1 = newProject.installAddress1Text;
                       salesOrder.shippingAddress.addressLine2 = newProject.installAddress2Text;
                       salesOrder.shippingAddress.city = newProject.installCityText;
                       salesOrder.shippingAddress.state = newProject.installState;
                       salesOrder.shippingAddress.zip = newProject.installZipCodeText;

                           newProject.sublists.boms.map(function(bom){
                               log.debug(bom);
                               salesOrder.upsertItem(bom);
                           });
                           newProject.sublists.adders.map(function(adder){
                               salesOrder.upsertItem(adder);
                           });

                           salesOrder.save();
                           if(salesOrder.internalId){
                               log.debug('success', ['Sales Order', salesOrder.internalId, 'updated successfully from project', newProject.internalId].join(' '));
                           } else {
                               log.error('error', ['failed to update sales order from project', newProject.internalId].join(' '));
                           }
                   }
                   if(trigger == 'delete'){
                   }
               } catch(error) {
                   log.error('error', error);
               }
           }

           function updateServices(newProject, salesOrder){}

           function updateNonInventory(newProject, salesOrder){}

           return {
               afterSubmit: afterSubmit
           };
       });
/*
  x generate sales order class
  x add project bom and adder lists to class
  x add shipping address subrecord to sales order
  - implement address entity save
  x add project ctor for loading from script context
  x add project oldRecord property
  x add hasDirtyFields function to compare this to oldRecord
  - add lookups for jobtype and location
 */
