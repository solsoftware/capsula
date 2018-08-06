!function(root,factory){"function"==typeof define&&define.amd?define(["./services","./capsula"],factory):"object"==typeof module&&module.exports?module.exports=factory(require("./services"),require("./capsula")):root.html=factory(root.services,root.capsula)}(this,function(services,cps){"use strict";cps.setDefaultElementHandlers(function(hookElement,loopElement,afterElement,classes){afterElement?hookElement.insertBefore(loopElement,afterElement):hookElement.appendChild(loopElement);for(var i=0;i<classes.length;i++)loopElement.classList.add(classes[i])},function(hookElement,loopElement,classes){loopElement.parentElement===hookElement&&hookElement.removeChild(loopElement);for(var i=0;i<classes.length;i++)loopElement.classList.remove(classes[i])},function(loopElement,classes){for(var classList=loopElement.classList;0<classList.length;)classList.remove(classList.item(0));classList.add.apply(classList,classes)});var Text$=cps.defCapsule({name:"Text",loops:"loop",listeners:"*{}",myText:{capsule:cps.ElementRef,deferredArgs:function(textOrTextNode){if(isTextNode_(textOrTextNode))return textOrTextNode;if(isString_(textOrTextNode))return document.createTextNode(textOrTextNode);throw new Error(Errors.ILLEGAL_ARGUMENT.toString("Make sure the first argument of the Text constructor is String or Text node."))}},init:function(textOrTextNode,opt_eventOutputs){if(null!=opt_eventOutputs){if(!isArray_(opt_eventOutputs))throw new Error(Errors.ILLEGAL_ARGUMENT.toString("Make sure argument opt_eventOutputs, if provided, is an array of Strings."));for(var i=0;i<opt_eventOutputs.length;i++)this.addEventOutput(opt_eventOutputs[i])}},"+ getText":function(){return this.myText.getElement().nodeValue},"+ setText":function(txt){return this.myText.getElement().nodeValue=txt},"+ getTextNode":function(){return this.myText.getElement()},"+ addEventOutput":function(eventName,opt_outputName){if(!isString_(eventName))throw new Error(Errors.ILLEGAL_ARGUMENT.toString("Make sure the eventName argument is a string denoting a legal event, for example like 'click' (without 'on' prefix)."));var outputName;if(null!=opt_outputName){if(!isString_(opt_outputName))throw new Error(Errors.ILLEGAL_ARGUMENT.toString("Make sure the opt_outputName argument is a string."));if(this[opt_outputName])throw new Error(Errors.ILLEGAL_ARGUMENT.toString("Make sure '"+opt_outputName+"' is not already existing property of this object."));outputName=opt_outputName}else{if(this[eventName])throw new Error(Errors.ILLEGAL_ARGUMENT.toString("Make sure '"+eventName+"' is not already existing property of this object."));outputName=eventName}var output=new cps.Output(outputName);this[outputName]=output;var listener=cps.contextualize(function(e){output(e)});this.listeners.get()[eventName]=listener,this.getTextNode().addEventListener(eventName,listener)},onDetach:function(){var listeners=this.listeners.get();for(var i in listeners)this.getTextNode().removeEventListener(i,listeners[i]);this.listeners=new cps.Datum({})},"this.loop":"myText.loop"}),HasRootHTML=cps.defCapsule({isAbstract:!0,loops:"loop","+ getElement":function(){return null},"+ getId":function(){return this.getElement().getAttribute("id")},"+ setId":function(id){this.getElement().setAttribute("id",id)},"+ getAttribute":function(name){return this.getElement().getAttribute(name)},"+ setAttribute":function(name,value){this.getElement().setAttribute(name,value)},"+ hasAttribute":function(name){return this.getElement().hasAttribute(name)},"+ removeAttribute":function(name){this.getElement().removeAttribute(name)},"+ getProperty":function(name){return this.getElement()[name]},"+ setProperty":function(name,value){this.getElement()[name]=value},"+ getStyle":function(name){return this.getElement().style[name]},"+ setStyle":function(name,value){this.getElement().style[name]=value},"+ addClass":function(className){this.getElement().classList.add(className)},"+ hasClass":function(className){return this.getElement().classList.contains(className)},"+ removeClass":function(className){this.getElement().classList.remove(className)},"+ getInnerHTML":function(){return this.getElement().innerHTML},"+ setInnerHTML":function(innerHTML){this.getElement().innerHTML=innerHTML},"+ getTagName":function(){return this.getElement().tagName},init:function(){}}),Element$=cps.defCapsule({base:HasRootHTML,hooks:"hook",loops:null,listeners:"*{}",init:function(tagNameOrNamespaceOrElement,opt_tagNameOrEventOutputs,opt_eventOutputs){var outputs=null,error=!1;if(isElement_(tagNameOrNamespaceOrElement)?isArray_(opt_tagNameOrEventOutputs)?outputs=opt_tagNameOrEventOutputs:null!=opt_tagNameOrEventOutputs&&(error=!0):isString_(tagNameOrNamespaceOrElement)&&isString_(opt_tagNameOrEventOutputs)?isArray_(opt_eventOutputs)?outputs=opt_eventOutputs:null!=opt_eventOutputs&&(error=!0):isString_(tagNameOrNamespaceOrElement)?isArray_(opt_tagNameOrEventOutputs)?outputs=opt_tagNameOrEventOutputs:null!=opt_tagNameOrEventOutputs&&(error=!0):error=!0,error)throw new Error(Errors.ILLEGAL_ARGUMENT.toString("Make sure you call Element constructor with appropriate arguments."));if(outputs)for(var i=0;i<outputs.length;i++)this.addEventOutput(outputs[i])},"+ addEventOutput":function(eventName,opt_outputName){if(!isString_(eventName))throw new Error(Errors.ILLEGAL_ARGUMENT.toString("Make sure the eventName argument is a string denoting a legal event, for example like 'click' (without 'on' prefix)."));var outputName;if(null!=opt_outputName){if(!isString_(opt_outputName))throw new Error(Errors.ILLEGAL_ARGUMENT.toString("Make sure the opt_outputName argument is a string."));if(this[opt_outputName])throw new Error(Errors.ILLEGAL_ARGUMENT.toString("Make sure '"+opt_outputName+"' is not already existing property of this object."));outputName=opt_outputName}else{if(this[eventName])throw new Error(Errors.ILLEGAL_ARGUMENT.toString("Make sure '"+eventName+"' is not already existing property of this object."));outputName=eventName}var output=new cps.Output(outputName);this[outputName]=output;var listener=cps.contextualize(function(e){output(e)});this.listeners.get()[eventName]=listener,this.getElement().addEventListener(eventName,listener)},onDetach:function(){var listeners=this.listeners.get();for(var i in listeners)this.getElement().removeEventListener(i,listeners[i]);this.listeners=new cps.Datum({})},root:{capsule:cps.ElementRef,deferredArgs:function(tagNameOrNamespaceOrElement,opt_tagNameOrEventOutputs,opt_eventOutputs){if(isElement_(tagNameOrNamespaceOrElement))return tagNameOrNamespaceOrElement;if(isString_(tagNameOrNamespaceOrElement)&&isString_(opt_tagNameOrEventOutputs))return document.createElementNS(tagNameOrNamespaceOrElement,opt_tagNameOrEventOutputs);if(isString_(tagNameOrNamespaceOrElement))return document.createElement(tagNameOrNamespaceOrElement);throw new Error(Errors.ILLEGAL_ARGUMENT.toString("Make sure you call Element constructor with appropriate arguments."))}},"+ getElement":function(){return this.root.getElement()},"this.hook":"root.hook","this.loop":"root.loop"}),Template=cps.defCapsule({listeners:"*[]",init:function(htmlCode){if(!isString_(htmlCode))throw new Error(Errors.ILLEGAL_ARGUMENT.toString("Make sure you call Template constructor with template literal argument (or String)."));var temp=document.createElement("div");temp.innerHTML=htmlCode;for(var i=0;i<temp.children.length;i++){var el=temp.children[i],loopName=el.getAttribute(T_LOOP),part=new cps.ElementRef(el);el.removeAttribute(T_LOOP),this[loopName]=new cps.Loop(loopName),this[loopName].tie(part.loop)}for(var hookNodeList=temp.querySelectorAll("["+T_HOOK+"]"),h=0;h<hookNodeList.length;h++){var hookElement=hookNodeList.item(h),hookRef=new cps.ElementRef(hookElement),hookName=hookElement.getAttribute(T_HOOK);hookElement.removeAttribute(T_HOOK),this[hookName]=new cps.Hook(hookName),hookRef.hook.tie(this[hookName])}function prop_(propName,propValue){this[propName]=propValue}function getprop_(propName){return this[propName]}function attr_(attrName,attrValue){this.setAttribute(attrName,attrValue)}function remattr_(attrName){this.removeAttribute(attrName)}function getattr_(attrName){return this.getAttribute(attrName)}function get_(){return this}function wrapper_(output){return function(e){output(e)}}this.doInputs_(temp,T_PROP,prop_),this.doInputs_(temp,T_GET_PROP,getprop_),this.doInputs_(temp,T_ATTR,attr_),this.doInputs_(temp,T_REM_ATTR,remattr_),this.doInputs_(temp,T_GET_ATTR,getattr_),this.doInputs_(temp,T_GET,get_);for(var outputNodeList=temp.querySelectorAll("["+T_OUTPUT+"]"),op=0;op<outputNodeList.length;op++){var outputElement=outputNodeList.item(op),outputName=outputElement.getAttribute(T_OUTPUT),eventName=outputElement.getAttribute(T_ON),output=this.getOutput(outputName);null==output&&(output=new cps.Output(outputName),this[outputName]=output);var listener=cps.contextualize(wrapper_(output));outputElement.addEventListener(eventName,listener),this.listeners.get().push({element:outputElement,event:eventName,handler:listener}),outputElement.removeAttribute(T_OUTPUT),outputElement.removeAttribute(T_ON)}},doInputs_:function(temp,attrName,inputTargetFunction){for(var inputNodeList=temp.querySelectorAll("["+attrName+"]"),i=0;i<inputNodeList.length;i++){var el=inputNodeList.item(i),inputName=el.getAttribute(attrName),input=this.getInput(inputName);null==input&&(input=new cps.Input(inputName),this[inputName]=input),input.wire(inputTargetFunction.bind(el)),el.removeAttribute(attrName)}},onDetach:function(){for(var listeners=this.listeners.get(),i=0;i<listeners.length;i++){var listener=listeners[i];listener.element.removeEventListener(listener.event,listener.handler)}this.listeners=new cps.Datum([])}}),T_LOOP="loop",T_HOOK="hook",T_PROP="prop",T_GET_PROP="getprop",T_ATTR="attr",T_GET_ATTR="getattr",T_REM_ATTR="remattr",T_OUTPUT="output",T_ON="on",T_GET="get",isArray_=function(){if(Array.isArray)return Array.isArray;var objectToStringFn=Object.prototype.toString,arrayToStringResult=objectToStringFn.call([]);return function(subject){return objectToStringFn.call(subject)===arrayToStringResult}}();function isElement_(obj){return obj instanceof Node&&obj instanceof Element}function isString_(obj){return"string"==typeof obj}function isTextNode_(obj){return obj instanceof Node&&obj instanceof Text}var Errors={ILLEGAL_ARGUMENT:new services.ErrorMessage(1e3,"Illegal argument(s). $1")},ServiceType={AJAX:"AJAX",AJAX_URL_ENCODED:"AJAX_URL_ENCODED",AJAX_JQUERY:"AJAX_JQUERY"};function isSuccess_(statusCode){return 200<=statusCode&&statusCode<300||304===statusCode}function createXMLHTTPRequest_(){return window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP")}return services.registerType(ServiceType.AJAX,function(requests,config,serviceName){for(var packed,responses,arr=[],i=0;i<requests.length;i++)arr.push(requests[i].body);packed=JSON.stringify(arr);var xhttp=createXMLHTTPRequest_();for(var header in!1!==config.async&&(xhttp.onreadystatechange=function(){4==this.readyState&&isSuccess_(this.status)?(responses=JSON.parse(this.responseText),isArray_(responses)&&responses.length===requests.length?services.resolveAllSuccessful(requests,responses):services.rejectAll(requests,new Error(services.Errors.ILLEGAL_RESPONSE_SIZE.toString()))):4==this.readyState&&services.rejectAll(requests,new Error(services.Errors.ERRONEOUS_RESPONSE.toString("Response status code: "+this.status+"."))),4==this.readyState&&(408==this.status?services.setServiceStatus(serviceName,"offline"):services.setServiceStatus(serviceName,"online"))}),xhttp.open(config.method,config.url,!1!==config.async,null!=config.user?config.user:null,null!=config.password?config.password:null),config.headers)xhttp.setRequestHeader(header,config.headers[header]);"function"==typeof config.beforeSend&&config.beforeSend(xhttp),xhttp.send(packed),!1===config.async&&(isSuccess_(xhttp.status)?(responses=JSON.parse(xhttp.responseText),isArray_(responses)&&responses.length===requests.length?services.resolveAllSuccessful(requests,responses):services.rejectAll(requests,new Error(services.Errors.ILLEGAL_RESPONSE_SIZE.toString()))):services.rejectAll(requests,new Error(services.Errors.ERRONEOUS_RESPONSE.toString("Response status code: "+xhttp.status+"."))),408==xhttp.status?services.setServiceStatus(serviceName,"offline"):services.setServiceStatus(serviceName,"online"))}),services.registerType(ServiceType.AJAX_URL_ENCODED,function(requests,config,serviceName){for(var packed,responses,arr=[],i=0;i<requests.length;i++)arr.push(requests[i].body);packed="encodedRequests="+encodeURIComponent(JSON.stringify(arr));var xhttp=createXMLHTTPRequest_();!1!==config.async&&(xhttp.onreadystatechange=function(){4==this.readyState&&isSuccess_(this.status)?(responses=JSON.parse(this.responseText),isArray_(responses)&&responses.length===requests.length?services.resolveAllSuccessful(requests,responses):services.rejectAll(requests,new Error(services.Errors.ILLEGAL_RESPONSE_SIZE.toString()))):4==this.readyState&&services.rejectAll(requests,new Error(services.Errors.ERRONEOUS_RESPONSE.toString("Response status code: "+this.status+"."))),4==this.readyState&&(408==this.status?services.setServiceStatus(serviceName,"offline"):services.setServiceStatus(serviceName,"online"))});var sep,index=config.url.indexOf("?");for(var header in sep=-1===index?"?":index===config.url.length-1?"":"&",xhttp.open(config.method,config.url+sep+packed,!1!==config.async,null!=config.user?config.user:null,null!=config.password?config.password:null),config.headers)xhttp.setRequestHeader(header,config.headers[header]);"function"==typeof config.beforeSend&&config.beforeSend(xhttp),xhttp.send(null),!1===config.async&&(isSuccess_(xhttp.status)?(responses=JSON.parse(xhttp.responseText),isArray_(responses)&&responses.length===requests.length?services.resolveAllSuccessful(requests,responses):services.rejectAll(requests,new Error(services.Errors.ILLEGAL_RESPONSE_SIZE.toString()))):services.rejectAll(requests,new Error(services.Errors.ERRONEOUS_RESPONSE.toString("Response status code: "+xhttp.status+"."))),408==xhttp.status?services.setServiceStatus(serviceName,"offline"):services.setServiceStatus(serviceName,"online"))}),services.registerType(ServiceType.AJAX_JQUERY,function(requests,config,serviceName){for(var packed,arr=[],i=0;i<requests.length;i++)arr.push(requests[i].body);packed=JSON.stringify(arr);var settings=Object.assign({},config);settings.data=packed,settings.dataType="json";var jQueryRequest=$.ajax(settings);jQueryRequest.done(function(responses){isArray_(responses)&&responses.length===requests.length?services.resolveAllSuccessful(requests,responses):services.rejectAll(requests,new Error(services.Errors.ILLEGAL_RESPONSE_SIZE.toString())),services.setServiceStatus(serviceName,"online")}),jQueryRequest.fail(function(jqXHR,textStatus,errorThrown){services.rejectAll(requests,errorThrown),408==jqXHR.status?services.setServiceStatus(serviceName,"offline"):services.setServiceStatus(serviceName,"online")})}),"function"!=typeof Object.assign&&Object.defineProperty(Object,"assign",{value:function(target,varArgs){if(null==target)throw new TypeError("Cannot convert undefined or null to object");for(var to=Object(target),index=1;index<arguments.length;index++){var nextSource=arguments[index];if(null!=nextSource)for(var nextKey in nextSource)Object.prototype.hasOwnProperty.call(nextSource,nextKey)&&(to[nextKey]=nextSource[nextKey])}return to},writable:!0,configurable:!0}),{Text:Text$,HasRootHTML:HasRootHTML,Element:Element$,Template:Template,Errors:Errors,ServiceType:ServiceType}});