(function(root,factory){if(typeof define==='function'&&define.amd){define(['./services','./capsula'],factory);}else if(typeof module==='object'&&module.exports){module.exports=factory(require('./services'),require('./capsula'));}else{root.html=factory(root.services,root.capsula);}}
(this,function(services,cps){'use strict';cps.setDefaultElementHandlers(function onHookDefault_(hookElement,loopElement,afterElement,classes){if(afterElement)
hookElement.insertBefore(loopElement,afterElement);else
hookElement.appendChild(loopElement);for(var i=0;i<classes.length;i++)
loopElement.classList.add(classes[i]);},function offHookDefault_(hookElement,loopElement,classes){if(loopElement.parentElement===hookElement)
hookElement.removeChild(loopElement);for(var i=0;i<classes.length;i++)
loopElement.classList.remove(classes[i]);},function setClassesDefault_(loopElement,classes){var classList=loopElement.classList;while(classList.length>0)
classList.remove(classList.item(0));classList.add.apply(classList,classes);});var Text$=cps.defCapsule({name:'Text',loops:'loop',listeners:'*{}',myText:{capsule:cps.ElementRef,deferredArgs:function(textOrTextNode){if(isTextNode_(textOrTextNode))
return textOrTextNode;else if(isString_(textOrTextNode))
return document.createTextNode(textOrTextNode);else
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure the first argument of the Text constructor is String or Text node.'));}},init:function(textOrTextNode,opt_eventOutputs){if(opt_eventOutputs!=null){if(!isArray_(opt_eventOutputs))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure argument opt_eventOutputs, if provided, is an array of Strings.'));for(var i=0;i<opt_eventOutputs.length;i++)
this.addEventOutput(opt_eventOutputs[i]);}},'+ getText':function(){return this.myText.getElement().nodeValue;},'+ setText':function(txt){return this.myText.getElement().nodeValue=txt;},'+ getTextNode':function(){return this.myText.getElement();},'+ addEventOutput':function(eventName,opt_outputName){if(!isString_(eventName))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure the eventName argument is a string denoting a legal event, for example like \'click\' (without \'on\' prefix).'));var outputName;if(opt_outputName!=null){if(!isString_(opt_outputName))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure the opt_outputName argument is a string.'));if(this[opt_outputName])
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \''+opt_outputName+'\' is not already existing property of this object.'));outputName=opt_outputName;}else{if(this[eventName])
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \''+eventName+'\' is not already existing property of this object.'));outputName=eventName;}
var output=new cps.Output(outputName);this[outputName]=output;var listener=cps.contextualize(function(e){output(e);});this.getData('listeners')[eventName]=listener;this.getTextNode().addEventListener(eventName,listener);},onDetach:function(){var listeners=this.getData('listeners');for(var i in listeners)
this.getTextNode().removeEventListener(i,listeners[i]);this.setData('listeners',{});},'this.loop':'myText.loop'});var HasRootHTML=cps.defCapsule({isAbstract:true,loops:'loop','+ getElement':function(){return null;},'+ getId':function(){return this.getElement().getAttribute('id');},'+ setId':function(id){this.getElement().setAttribute('id',id);},'+ getAttribute':function(name){return this.getElement().getAttribute(name);},'+ setAttribute':function(name,value){this.getElement().setAttribute(name,value);},'+ hasAttribute':function(name){return this.getElement().hasAttribute(name);},'+ removeAttribute':function(name){this.getElement().removeAttribute(name);},'+ getProperty':function(name){return this.getElement()[name];},'+ setProperty':function(name,value){this.getElement()[name]=value;},'+ getStyle':function(name){return this.getElement().style[name];},'+ setStyle':function(name,value){this.getElement().style[name]=value;},'+ addClass':function(className){this.getElement().classList.add(className);},'+ hasClass':function(className){return this.getElement().classList.contains(className);},'+ removeClass':function(className){this.getElement().classList.remove(className);},'+ getInnerHTML':function(){return this.getElement().innerHTML;},'+ setInnerHTML':function(innerHTML){this.getElement().innerHTML=innerHTML;},'+ getTagName':function(){return this.getElement().tagName;},init:function(){}});var Element$=cps.defCapsule({base:HasRootHTML,hooks:'hook',loops:null,listeners:'*{}',init:function(tagNameOrNamespaceOrElement,opt_tagNameOrEventOutputs,opt_eventOutputs){var outputs=null,error=false;if(isElement_(tagNameOrNamespaceOrElement)){if(isArray_(opt_tagNameOrEventOutputs))
outputs=opt_tagNameOrEventOutputs;else if(opt_tagNameOrEventOutputs!=null)
error=true;}else if(isString_(tagNameOrNamespaceOrElement)&&isString_(opt_tagNameOrEventOutputs)){if(isArray_(opt_eventOutputs))
outputs=opt_eventOutputs;else if(opt_eventOutputs!=null)
error=true;}else if(isString_(tagNameOrNamespaceOrElement)){if(isArray_(opt_tagNameOrEventOutputs))
outputs=opt_tagNameOrEventOutputs;else if(opt_tagNameOrEventOutputs!=null)
error=true;}else
error=true;if(error)
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure you call Element constructor with appropriate arguments.'));if(outputs)
for(var i=0;i<outputs.length;i++)
this.addEventOutput(outputs[i]);},'+ addEventOutput':function(eventName,opt_outputName){if(!isString_(eventName))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure the eventName argument is a string denoting a legal event, for example like \'click\' (without \'on\' prefix).'));var outputName;if(opt_outputName!=null){if(!isString_(opt_outputName))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure the opt_outputName argument is a string.'));if(this[opt_outputName])
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \''+opt_outputName+'\' is not already existing property of this object.'));outputName=opt_outputName;}else{if(this[eventName])
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \''+eventName+'\' is not already existing property of this object.'));outputName=eventName;}
var output=new cps.Output(outputName);this[outputName]=output;var listener=cps.contextualize(function(e){output(e);});this.getData('listeners')[eventName]=listener;this.getElement().addEventListener(eventName,listener);},onDetach:function(){var listeners=this.getData('listeners');for(var i in listeners)
this.getElement().removeEventListener(i,listeners[i]);this.setData('listeners',{});},root:{capsule:cps.ElementRef,deferredArgs:function(tagNameOrNamespaceOrElement,opt_tagNameOrEventOutputs,opt_eventOutputs){if(isElement_(tagNameOrNamespaceOrElement))
return tagNameOrNamespaceOrElement;else if(isString_(tagNameOrNamespaceOrElement)&&isString_(opt_tagNameOrEventOutputs))
return document.createElementNS(tagNameOrNamespaceOrElement,opt_tagNameOrEventOutputs);else if(isString_(tagNameOrNamespaceOrElement))
return document.createElement(tagNameOrNamespaceOrElement);else
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure you call Element constructor with appropriate arguments.'));}},'+ getElement':function(){return this.root.getElement();},'this.hook':'root.hook','this.loop':'root.loop'});var Template=cps.defCapsule({listeners:'*[]',init:function(htmlCode){if(!isString_(htmlCode))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure you call Template constructor with template literal argument (or String).'));var temp=document.createElement('div');temp.innerHTML=htmlCode;for(var i=0;i<temp.children.length;i++){var el=temp.children[i],loopName=el.getAttribute(T_LOOP),part=new cps.ElementRef(el);el.removeAttribute(T_LOOP);this[loopName]=new cps.Loop(loopName);this[loopName].tie(part.loop);}
var hookNodeList=temp.querySelectorAll('['+T_HOOK+']');for(var h=0;h<hookNodeList.length;h++){var hookElement=hookNodeList.item(h),hookRef=new cps.ElementRef(hookElement),hookName=hookElement.getAttribute(T_HOOK);hookElement.removeAttribute(T_HOOK);this[hookName]=new cps.Hook(hookName);hookRef.hook.tie(this[hookName]);}
function prop_(propName,propValue){this[propName]=propValue;}
function getprop_(propName){return this[propName];}
function attr_(attrName,attrValue){this.setAttribute(attrName,attrValue);}
function remattr_(attrName){this.removeAttribute(attrName);}
function getattr_(attrName){return this.getAttribute(attrName);}
function get_(){return this;}
this.doInputs_(temp,T_PROP,prop_);this.doInputs_(temp,T_GET_PROP,getprop_);this.doInputs_(temp,T_ATTR,attr_);this.doInputs_(temp,T_REM_ATTR,remattr_);this.doInputs_(temp,T_GET_ATTR,getattr_);this.doInputs_(temp,T_GET,get_);function wrapper_(output){return function(e){output(e);}}
var outputNodeList=temp.querySelectorAll('['+T_OUTPUT+']'),that=this;for(var op=0;op<outputNodeList.length;op++){var outputElement=outputNodeList.item(op),outputName=outputElement.getAttribute(T_OUTPUT),eventName=outputElement.getAttribute(T_ON),output=this.getOutput(outputName);if(output==null){output=new cps.Output(outputName);this[outputName]=output;}
var listener=cps.contextualize(wrapper_(output));outputElement.addEventListener(eventName,listener);this.getData('listeners').push({element:outputElement,event:eventName,handler:listener});outputElement.removeAttribute(T_OUTPUT);outputElement.removeAttribute(T_ON);}},doInputs_:function(temp,attrName,inputTargetFunction){var inputNodeList=temp.querySelectorAll('['+attrName+']');for(var i=0;i<inputNodeList.length;i++){var el=inputNodeList.item(i),inputName=el.getAttribute(attrName),input=this.getInput(inputName);if(input==null){input=new cps.Input(inputName);this[inputName]=input;}
input.wire(inputTargetFunction.bind(el));el.removeAttribute(attrName);}},onDetach:function(){var listeners=this.getData('listeners');for(var i=0;i<listeners.length;i++){var listener=listeners[i];listener.element.removeEventListener(listener.event,listener.handler);}
this.setData('listeners',[]);}});var T_LOOP='loop',T_HOOK='hook',T_PROP='prop',T_GET_PROP='getprop',T_ATTR='attr',T_GET_ATTR='getattr',T_REM_ATTR='remattr',T_OUTPUT='output',T_ON='on',T_GET='get';var isArray_=(function(){if(Array.isArray){return Array.isArray;}
var objectToStringFn=Object.prototype.toString,arrayToStringResult=objectToStringFn.call([]);return function(subject){return objectToStringFn.call(subject)===arrayToStringResult;};}
());function isElement_(obj){return obj instanceof Node&&obj instanceof Element;}
function isString_(obj){return typeof obj==='string';}
function isTextNode_(obj){return obj instanceof Node&&obj instanceof Text;}
var Errors={ILLEGAL_ARGUMENT:new services.ErrorMessage(1000,'Illegal argument(s). $1')};var ServiceType={AJAX:'AJAX',AJAX_URL_ENCODED:'AJAX_URL_ENCODED',AJAX_JQUERY:'AJAX_JQUERY'};services.registerType(ServiceType.AJAX,function(requests,config){var arr=[],packed,responses;for(var i=0;i<requests.length;i++)
arr.push(requests[i].body);packed=JSON.stringify(arr);var xhttp=createXMLHTTPRequest_();if(config.async!==false)
xhttp.onreadystatechange=function(){if(this.readyState==4&&this.status==200){responses=JSON.parse(this.responseText);if(!isArray_(responses)||responses.length!==requests.length)
services.rejectAll(requests,new Error(services.Errors.ILLEGAL_RESPONSE_SIZE.toString()));else
services.resolveAllSuccessful(requests,responses);}else if(this.readyState==4){services.rejectAll(requests,new Error(services.Errors.ERRONEOUS_RESPONSE.toString('Response status code: '+this.status+'.')));}};xhttp.open(config.method,config.url,(config.async===false?false:true),(config.user!=null?config.user:null),(config.password!=null?config.password:null));for(var header in config.headers)
xhttp.setRequestHeader(header,config.headers[header]);if(typeof config.beforeSend==='function')
config.beforeSend(xhttp);xhttp.send(packed);if(config.async===false){if(xhttp.status===200){responses=JSON.parse(xhttp.responseText);if(!isArray_(responses)||responses.length!==requests.length)
services.rejectAll(requests,new Error(services.Errors.ILLEGAL_RESPONSE_SIZE.toString()));else
services.resolveAllSuccessful(requests,responses);}else{services.rejectAll(requests,new Error(services.Errors.ERRONEOUS_RESPONSE.toString('Response status code: '+xhttp.status+'.')));}}});services.registerType(ServiceType.AJAX_URL_ENCODED,function(requests,config){var arr=[],packed,responses;for(var i=0;i<requests.length;i++)
arr.push(requests[i].body);packed='encodedRequests='+encodeURIComponent(JSON.stringify(arr));var xhttp=createXMLHTTPRequest_();if(config.async!==false)
xhttp.onreadystatechange=function(){if(this.readyState==4&&this.status==200){responses=JSON.parse(this.responseText);if(!isArray_(responses)||responses.length!==requests.length)
services.rejectAll(requests,new Error(services.Errors.ILLEGAL_RESPONSE_SIZE.toString()));else
services.resolveAllSuccessful(requests,responses);}else if(this.readyState==4){services.rejectAll(requests,new Error(services.Errors.ERRONEOUS_RESPONSE.toString('Response status code: '+this.status+'.')));}};var index=config.url.indexOf('?'),sep;if(index===-1)
sep='?';else if(index===config.url.length-1)
sep='';else
sep='&';xhttp.open(config.method,config.url+sep+packed,(config.async===false?false:true),(config.user!=null?config.user:null),(config.password!=null?config.password:null));for(var header in config.headers)
xhttp.setRequestHeader(header,config.headers[header]);if(typeof config.beforeSend==='function')
config.beforeSend(xhttp);xhttp.send(null);if(config.async===false){if(xhttp.status===200){responses=JSON.parse(xhttp.responseText);if(!isArray_(responses)||responses.length!==requests.length)
services.rejectAll(requests,new Error(services.Errors.ILLEGAL_RESPONSE_SIZE.toString()));else
services.resolveAllSuccessful(requests,responses);}else{services.rejectAll(requests,new Error(services.Errors.ERRONEOUS_RESPONSE.toString('Response status code: '+xhttp.status+'.')));}}});services.registerType(ServiceType.AJAX_JQUERY,function(requests,config){var arr=[],packed;for(var i=0;i<requests.length;i++)
arr.push(requests[i].body);packed=JSON.stringify(arr);var settings=Object.assign({},config);settings.data=packed;settings.dataType='json';var jQueryRequest=$.ajax(settings);jQueryRequest.done(function(responses){if(!isArray_(responses)||responses.length!==requests.length)
services.rejectAll(requests,new Error(services.Errors.ILLEGAL_RESPONSE_SIZE.toString()));else
services.resolveAllSuccessful(requests,responses);});jQueryRequest.fail(function(jqXHR,textStatus,errorThrown){services.rejectAll(requests,errorThrown);});});function createXMLHTTPRequest_(){var xhttp;if(window.XMLHttpRequest){xhttp=new XMLHttpRequest();}else{xhttp=new ActiveXObject("Microsoft.XMLHTTP");}
return xhttp;}
if(typeof Object.assign!=='function'){Object.defineProperty(Object,"assign",{value:function assign(target,varArgs){'use strict';if(target==null){throw new TypeError('Cannot convert undefined or null to object');}
var to=Object(target);for(var index=1;index<arguments.length;index++){var nextSource=arguments[index];if(nextSource!=null){for(var nextKey in nextSource){if(Object.prototype.hasOwnProperty.call(nextSource,nextKey)){to[nextKey]=nextSource[nextKey];}}}}
return to;},writable:true,configurable:true});}
var ns={Text:Text$,HasRootHTML:HasRootHTML,Element:Element$,Template:Template,Errors:Errors,ServiceType:ServiceType}
return ns;}));