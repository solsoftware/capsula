(function(root,factory){if(typeof define==='function'&&define.amd){define([],factory);}else if(typeof module==='object'&&module.exports){module.exports=factory();}else{root.services=factory();}}
(this,function(){'use strict';var ServiceType={FUNCTION:'FUNCTION',WORKER:'WORKER'};function registerType(serviceType,serviceFunction){if(!isString_(serviceType))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure serviceType is a string.'));if(typeof serviceFunction!=='function')
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure serviceFunction is a function.'));serviceTypes_[serviceType]=serviceFunction;}
function register(serviceName,serviceConfig,opt_overwrite){if(!isString_(serviceName))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure serviceName is a string.'));if(serviceConfig==null||!isString_(serviceConfig.type)||typeof serviceTypes_[serviceConfig.type]!=='function')
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure serviceConfig is not null and serviceConfig.type is a string which specifies existing serviceType (see method registerType).'));if(!opt_overwrite&&serviceRegistry_[serviceName])
throw new Error(Errors.SERVICE_ALREADY_REGISTERED.toString(serviceName));serviceRegistry_[serviceName]=serviceConfig;}
function unregister(serviceName){if(!isRegistered(serviceName))
throw new Error(Errors.SERVICE_UNREGISTERED.toString(serviceName));delete serviceRegistry_[serviceName];}
function isRegistered(serviceName){if(!isString_(serviceName))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure serviceName is a string.'));return(!!serviceRegistry_[serviceName]);}
function send(serviceName,request){if(!isRegistered(serviceName))
throw new Error(Errors.SERVICE_UNREGISTERED.toString(serviceName));var buffer=serviceBuffers_[serviceName];if(!buffer){buffer=[];serviceBuffers_[serviceName]=buffer;}
var r=new Request(request);buffer.push(r);return r.promise;}
function flush(serviceName){if(!isRegistered(serviceName))
throw new Error(Errors.SERVICE_UNREGISTERED.toString(serviceName));var serviceConfig=serviceRegistry_[serviceName],serviceFunction=serviceTypes_[serviceConfig.type],serviceBuffer=serviceBuffers_[serviceName];if(!serviceBuffer||serviceBuffer.length===0)
return;serviceBuffers_[serviceName]=[];serviceFunction(serviceBuffer,serviceConfig);}
function flushAll(){for(var serviceName in serviceRegistry_)
flush(serviceName);}
function Request(body){this.body=body;this.resolve;this.reject;var that=this;this.promise=new Promise(function(resolve,reject){that.resolve=resolve;that.reject=reject;});}
var serviceRegistry_={},serviceBuffers_={},serviceTypes_={};var isArray_=(function(){if(Array.isArray){return Array.isArray;}
var objectToStringFn=Object.prototype.toString,arrayToStringResult=objectToStringFn.call([]);return function(subject){return objectToStringFn.call(subject)===arrayToStringResult;};}
());function isNumber_(obj){return typeof obj==='number';}
function isObject_(obj){return obj&&typeof obj==='object'&&!isArray_(obj);}
function isString_(obj){return typeof obj==='string';}
function checkFunction_(fn,name){if(typeof fn!=='function')
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure '+name+' is a function (if provided).'));}
function ErrorMessage(code,desc){if(!isNumber_(code))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure code is a number.'));if(!isString_(desc))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure desc is a string.'));this.code=code;this.desc=desc;}
ErrorMessage.prototype.toString=function(var_args){var desc=this.desc;for(var i=0;i<arguments.length;i++)
desc=desc.replace('$'+(i+1),arguments[i]);return'Oops! '+desc+' (#'+this.code+')';};ErrorMessage.prototype.isTypeOf=function(error){return error.message.indexOf('#'+this.code)!==-1;};registerType(ServiceType.FUNCTION,function(requests,config){var packed=[];for(var i=0;i<requests.length;i++)
packed.push(requests[i].body);var responses;try{responses=config.func(packed);if(!isArray_(responses)||responses.length!==requests.length)
throw new Error(Errors.ILLEGAL_RESPONSE_SIZE.toString());}catch(err){rejectAll(requests,err);return;}
resolveAllSuccessful(requests,responses);});registerType(ServiceType.WORKER,function(requests,config){var packed=[];for(var i=0;i<requests.length;i++)
packed.push(requests[i].body);config.worker.postMessage(packed);config.worker.addEventListener('message',function(result){var responses=result.data;if(!isArray_(responses)||responses.length!==requests.length)
rejectAll(requests,new Error(Errors.ILLEGAL_RESPONSE_SIZE.toString()));else
resolveAllSuccessful(requests,responses);});config.worker.addEventListener('error',function(err){rejectAll(requests,err);});});function resolveAll(requests,responses){for(var i=0;i<responses.length;i++)
requests[i].resolve(responses[i]);}
function rejectAll(requests,err){for(var i=0;i<requests.length;i++)
requests[i].reject(err);}
function resolveAllSuccessful(requests,responses){for(var i=0;i<responses.length;i++){var request=requests[i],response=responses[i];if(response!=null&&response.success)
request.resolve(response);else if(response!=null)
request.reject(response.error);else
request.reject(new Error(Errors.ERRONEOUS_RESPONSE.toString()));}}
var Errors={ILLEGAL_ARGUMENT:new ErrorMessage(2000,'Illegal argument(s). $1'),SERVICE_UNREGISTERED:new ErrorMessage(2001,'The service with the given name has not been registered: $1.'),SERVICE_ALREADY_REGISTERED:new ErrorMessage(2002,'The service with the given name has already been registered: $1.'),ILLEGAL_RESPONSE_SIZE:new ErrorMessage(2003,'Make sure the service returns an array equally sized to the number of (logical) requests.'),ERRONEOUS_RESPONSE:new ErrorMessage(2004,'The service returned an erroneous response. $1')};var ns={ServiceType:ServiceType,register:register,unregister:unregister,isRegistered:isRegistered,send:send,flush:flush,flushAll:flushAll,registerType:registerType,resolveAll:resolveAll,rejectAll:rejectAll,resolveAllSuccessful:resolveAllSuccessful,Errors:Errors,ErrorMessage:ErrorMessage};return ns;}));