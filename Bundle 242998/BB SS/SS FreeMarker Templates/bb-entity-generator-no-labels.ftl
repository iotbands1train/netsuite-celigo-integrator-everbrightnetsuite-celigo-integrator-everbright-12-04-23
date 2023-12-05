<#macro defineProperty fieldName>
      '${fieldName.instance}' : {
         enumerable: true,
         get: function() {
            return _${fieldName.instance};
         },
         set: function(val) {
            _${fieldName.instance} = val;
         }
      }</#macro>

BB.Record.${metadata.type?capitalize} = function(params) {
    params = JSON.parse(JSON.stringify(params));
   <#list metadata.fields as field>
   var _${field.instance} = undefined;
   </#list>

   var __changes = {
   <#list metadata.fields as field>
      <#if field_index == 0>
      ${field.instance}: false,
      <#elseif !field_has_next>
      ${field.instance}: false,
      <#else>
      ${field.instance}: false,
      </#if>
   </#list>
   <#list metadata.fields as field>
      <#if field_index == 0>
      hasChanges: function() {
         return this.${field.instance} ||
      <#elseif !field_has_next>
            this.${field.instance};
      },
      <#else>
            this.${field.instance} ||
      </#if>
   </#list>
   <#list metadata.fields as field>
      <#if field_index == 0>
      clear: function() {
         ${field.instance} = false;
      <#elseif !field_has_next>
         ${field.instance} = false;
      }
      <#else>
         ${field.instance} = false;
      </#if>
   </#list>
   };

   function notEmpty(element) {
      return typeof element !== 'undefined' && element != '';
   }
   
   <#list metadata.fields as field>
   <#if field_index == 0>

   Object.defineProperties(this, {
<@defineProperty fieldName=field/>,
   <#elseif !field_has_next>
   <@defineProperty fieldName=field/>,
        '__changes': {
            enumerable: true,
            get: function() {
                return __changes;
            }
        }
   });
   <#else>
<@defineProperty fieldName=field/>,
   </#if>
   </#list>
   <#list metadata.fields as field>
   <#if field_index == 0>   

    if(params && params.fields){
        // loading from NS context
        var staticFields = Object.invert(BB.Record.${metadata.type?capitalize}.Fields);
        for (var field in params.fields) {
            var staticField = staticFields[field];
            if(!staticField) continue;
            this[staticField.toLowerCase().toCamelCase()] = params.fields[field];
        }
    } else if (params) {
      this.${field.instance} = params.${field.instance};
   <#elseif !field_has_next>
      this.${field.instance} = params.${field.instance};
   }
   <#else>
      this.${field.instance} = params.${field.instance};
   </#if>
   </#list>
};

BB.Record.${metadata.type?capitalize}.TYPE = '${metadata.type}';

BB.Record.${metadata.type?capitalize}.Fields = {
   <#list metadata.fields as field>
   <#if !field_has_next>
      ${field.static}: '${field.id}'
   };
   <#else>
      ${field.static}: '${field.id}',
   </#if>
   </#list>

BB.Record.${metadata.type?capitalize}.prototype.constructor = BB.Record.${metadata.type};

BB.Record.${metadata.type?capitalize}.prototype.create = function() {};

BB.Record.${metadata.type?capitalize}.prototype.load = function() {
  var _netsuiteRecord = undefined,
      _this = this;

    // Load the existing record
   require(['N/record'], function(record) {
      _netsuiteRecord = record.load({
        type: BB.Record.${metadata.type?capitalize}.TYPE,
        id: _this.internalId,
        isDynamic: true
      });
   });

    for(var field in BB.Record.${metadata.type?capitalize}.Fields){
        _this[field.toLowerCase().toCamelCase()] = _netsuiteRecord.getValue({
            fieldId: BB.Record.${metadata.type?capitalize}.Fields[field]
        });
   }

  _this.__changes.clear();

  return this;
};

BB.Record.${metadata.type?capitalize}.prototype.save = function() {
  var _netsuiteRecord = undefined,
      _this = this,
      isNew = typeof this.internalId === 'undefined';

  if (isNew) {
    require(['N/record'], function(record) {
      _netsuiteRecord = record.create({
        type: BB.Record.${metadata.type?capitalize}.TYPE,
        isDynamic: true
      });
    });
  } else {
    // Load the existing record
    require(['N/record'], function(record) {
      _netsuiteRecord = record.load({
        type: BB.Record.${metadata.type?capitalize}.TYPE,
        id: _this.internalId,
        isDynamic: true
      });
    });
  }
    for(var field in BB.Record.${metadata.type?capitalize}.Fields){
        var property = field.toLowerCase().toCamelCase();
        if(this.__changes[property]){
            _netsuiteRecord.setValue({
                fieldId: BB.Record.${metadata.type?capitalize}.Fields[field],
                value: this[property]
            });
        }
    }

  this.internalId = _netsuiteRecord.save({
    enableSourcing: true
  });

  this.__changes.clear();

  return this;
};

BB.Record.${metadata.type?capitalize}.prototype.delete = function() {};

