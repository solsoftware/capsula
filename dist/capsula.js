(function(root,factory){if(typeof define==='function'&&define.amd){define(['services'],factory);}else if(typeof module==='object'&&module.exports){module.exports=factory(require('services'));}else{root.capsula=factory(root.services);}}
(this,function(services){'use strict';var idGen_=0;function PrivateData_(){this.id=++idGen_;this.name=null;this.owner=null;}
function CapsuleData_(){PrivateData_.call(this);this.parts=[];this.pins=[];this.hooks=[];this.loops=[];this.data={};this.currentOperation=null;this.superPrototype=null;}
CapsuleData_.prototype=Object.create(PrivateData_.prototype);function OperationData_(){PrivateData_.call(this);this.isInput=false;this.targets=[];this.entryEnabled=true;this.exitEnabled=true;this.entryPipe=null;this.exitPipe=null;this.entryLastVal=null;this.exitLastVal=null;this.unpack=true;}
OperationData_.prototype=Object.create(PrivateData_.prototype);function HookLoopData_(){PrivateData_.call(this);this.up=null;this.el=null;this.onHook=null;this.offHook=null;}
HookLoopData_.prototype=Object.create(PrivateData_.prototype);function HookData_(){HookLoopData_.call(this);this.children=[];this.cls=null;}
HookData_.prototype=Object.create(HookLoopData_.prototype);function LoopData_(){HookLoopData_.call(this);this.down=null;this.ref=null;}
LoopData_.prototype=Object.create(HookLoopData_.prototype);function Capsule(){var privateData=new CapsuleData_();privateData.name='c_'+privateData.id;this._=privateData;}
function Operation_(name,func,isInput){if(name)
checkName_(name);var that;if(isInput)
that=function Input(){return operationImpl_(that,arguments);};else
that=function Output(){return operationImpl_(that,arguments);};Object.setPrototypeOf(that,oProto_);var privateData=new OperationData_();if(!name)
name='o_'+privateData.id;privateData.name=name;privateData.owner=ctx_;privateData.owner._.pins.push(that);privateData.isInput=isInput?true:false;if(typeof func==='function')
privateData.targets.push(func);privateData.call=function(var_args){return operationImplNoContextCheck_(that,arguments);};privateData.send=function(var_args){return sendNoCheck_(that,arguments);};that._=privateData;return that;}
var oProto_=Object.create(Function.prototype);function Operation(){}
Operation.prototype=oProto_;function Input(opt_name,opt_function){return Operation_(opt_name,opt_function,true);}
function Output(opt_name){return Operation_(opt_name,null,false);}
function Hook(opt_name){if(opt_name)
checkName_(opt_name);var that=Object.create(Hook.prototype);var privateData=new HookData_();if(!opt_name)
opt_name='h_'+privateData.id;privateData.name=opt_name;privateData.owner=ctx_;privateData.owner._.hooks.push(that);that._=privateData;return that;}
function Loop(opt_name){if(opt_name)
checkName_(opt_name);var that=Object.create(Loop.prototype);var privateData=new LoopData_();if(!opt_name)
opt_name='l_'+privateData.id;privateData.name=opt_name;privateData.owner=ctx_;privateData.owner._.loops.push(that);that._=privateData;return that;}
var ctx_;function switchContext_(newCtx,oldCtx){if(newCtx===oldCtx)
return;ctx_=newCtx;}
function executeInContext_(fn,newCtx,self,args){var oldCtx=ctx_;switchContext_(newCtx,oldCtx);try{return fn.apply(self,args);}catch(e){return handleError_(e);}
finally{switchContext_(oldCtx,newCtx);}}
function doInContext_(f1,f2,obj,args){if(obj._.owner===ctx_)
if(typeof f1==='function')
return f1.apply(obj,args);else
return f1;else if(obj._.owner._.owner===ctx_)
if(typeof f2==='function')
return f2.apply(obj,args);else
return f2;else
checkContextOrSubProperty_(obj);}
function contextualize(f){if(typeof f!=='function')
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure f is a function.'));return contextWrapper_(f,ctx_);}
var defaultInit_=function init(){var superiorPrototype=this.superior();if(superiorPrototype!==Capsule.prototype)
superiorPrototype.init.apply(this,arguments);};function defCapsule(def){var CapsuleClass=function CapsuleClass(){var that,cd=CapsuleClass.compiledDef;if(!this||!this.isCapsuleConstructed){if(cd.isAbstract)
throw new Error(Errors.ABSTRACT_INSTANTIATION.toString());that=Object.create(CapsuleClass.prototype);Object.defineProperty(that,'isCapsuleConstructed',{value:true,writeable:false,enumerable:false});}else{throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'this\' is not an already constructed capsule.'));}
Capsule.apply(that,arguments);var args=arguments;executeInContext_(function(){newInterface_(that,cd.inputs,Input);newInterface_(that,cd.outputs,Output);newInterface_(that,cd.hooks,Hook);newInterface_(that,cd.loops,Loop);newPublicMethods_(that,cd.publicMethods);newTargets_(that,cd.inputs);newParts_(that,cd.parts,args);newData_(that,cd.data,args);newFilters_(that,cd.filters);newWires_(that,cd.wires);newTies_(that,cd.ties);newUnclassified_(that,cd.unclassified);that.init.apply(that,args);},that);if(ctx_){that._.owner=ctx_;ctx_._.parts.push(that);if(typeof that.onAttach==='function')
executeInContext_(that.onAttach,that,that);}
return that;};var compiledDef=compileDef_(def);CapsuleClass.compiledDef=compiledDef;extend(CapsuleClass,compiledDef.base?compiledDef.base:Capsule);CapsuleClass.prototype.name=compiledDef.name;for(var name in compiledDef.ownedPrivateMethods)
CapsuleClass.prototype[name]=privateWrapper_(compiledDef.ownedPrivateMethods[name],CapsuleClass.super$.prototype);for(var name in compiledDef.ownedPublicMethods)
CapsuleClass.prototype[name]=publicWrapper_(compiledDef.ownedPublicMethods[name],CapsuleClass.super$.prototype);return CapsuleClass;}
function compileDef_(def){if(!isObject_(def))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure the \'def\' argument is an object.'));var compiled={inputs:[],outputs:[],hooks:[],loops:[],methodsVisibility:{},publicMethods:{},privateMethods:{},parts:{},data:{},wires:[],ties:[],filters:[],unclassified:[],ownedMethods:[],ownedPrivateMethods:{},ownedPublicMethods:{},};var base=def.base;if(base&&(typeof base!=='function'||!isCapsuleConstructor(base)))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'base\' is a function (capsule constructor).'));compiled.base=base;if(!isNothing_(base)){var compiledBaseDef=base.compiledDef;Array.prototype.push.apply(compiled.inputs,compiledBaseDef.inputs);Array.prototype.push.apply(compiled.outputs,compiledBaseDef.outputs);Array.prototype.push.apply(compiled.hooks,compiledBaseDef.hooks);Array.prototype.push.apply(compiled.loops,compiledBaseDef.loops);for(var v in compiledBaseDef.methodsVisibility)
compiled.methodsVisibility[v]=compiledBaseDef.methodsVisibility[v];for(var m in compiledBaseDef.publicMethods)
compiled.publicMethods[m]=compiledBaseDef.publicMethods[m];for(var pm in compiledBaseDef.privateMethods)
compiled.privateMethods[pm]=compiledBaseDef.privateMethods[pm];for(var d in compiledBaseDef.data)
compiled.data[d]=compiledBaseDef.data[d];for(var p in compiledBaseDef.parts)
compiled.parts[p]=compiledBaseDef.parts[p];Array.prototype.push.apply(compiled.wires,base.compiledDef.wires);Array.prototype.push.apply(compiled.ties,base.compiledDef.ties);Array.prototype.push.apply(compiled.filters,base.compiledDef.filters);Array.prototype.push.apply(compiled.unclassified,base.compiledDef.unclassified);}
var bindings=[];for(var key in def){var value=def[key],trimmedKey=key.trim(),isInput=trimmedKey.indexOf('>')===0,isOutput=trimmedKey.indexOf('<')===0,isPublic=trimmedKey.indexOf('+')===0,isFilter=trimmedKey.indexOf('f ')===0||trimmedKey.indexOf('F ')===0,isDot=trimmedKey.indexOf('.')!==-1;if(trimmedKey==='isAbstract'){if(!isNothing_(value)&&typeof value!=='boolean')
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'isAbstract\' is a boolean value.'));compiled.isAbstract=value;continue;}else if(trimmedKey==='name'){if(!isNothing_(value)&&typeof value!=='string')
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'name\' is a string value.'));compiled.name=value;continue;}else if(trimmedKey==='base'){continue;}else if(trimmedKey==='init'){if(value){if(typeof value!=='function')
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure init is a function.'));compiled.ownedPrivateMethods.init=value;}
continue;}else if(trimmedKey==='handle'){if(value){if(typeof value!=='function')
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure handle is a function.'));compiled.ownedPrivateMethods.handle=value;}
continue;}else if(trimmedKey==='hooks'||trimmedKey==='loops'){if(isString_(value)){compiled[trimmedKey].push(value);}else if(isArray_(value)){if(!areAllStrings_(value))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure '+trimmedKey+' is an array of strings.'));Array.prototype.push.apply(compiled[trimmedKey],value);}else if(value!=null){throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure '+trimmedKey+' is a string or an array of strings.'));}
continue;}else if(isInput||isOutput){var operation=trimmedKey.substring(1).trim();if(operation.length===0)
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \''+key+'\' contains at least one real character after the angle bracket.'));(isInput?compiled.inputs:compiled.outputs).push(operation);if(isNothing_(value)||typeof value==='function'){if(typeof value==='function'&&isInput)
compiled.ownedPrivateMethods[operation]=value;}else if(isString_(value)){if(isInput)
bindings.push(['this.'+operation,value]);else
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure you don\'t wire output operations in declaration.'));}else if(isArray_(value)){if(isInput){for(var opi=0;opi<value.length;opi++){var valueOpi=value[opi];if(!isString_(valueOpi))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure array for operation '+operation+' contains strings only.'));bindings.push(['this.'+operation,valueOpi]);}}else
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure you don\'t wire output operations in declaration.'));}else{throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure operation is declared using null, string, or javascript function in: \''+key+'\'.'));}
continue;}else if(isPublic){if(typeof value!=='function')
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure public method is declared using javascript function in: \''+key+'\'.'));var method=trimmedKey.substring(1).trim();if(method.length===0)
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \''+key+'\' contains at least one real character after the + sign.'));if(compiled.ownedMethods.indexOf(method)!==-1)
throw new Error(Errors.DUPLICATE_NAME.toString(method));var visibility=compiled.methodsVisibility[method];if(!isNothing_(visibility)){if(visibility===VisibilityType.PRIVATE)
throw new Error(Errors.ILLEGAL_METHODS_VISIBILITY.toString(method,'private'));}else{compiled.methodsVisibility[method]=VisibilityType.PUBLIC;}
compiled.ownedMethods.push(method);compiled.ownedPublicMethods[method]=value;compiled.publicMethods[method]=value;continue;}else if(isFilter){if(typeof value!=='function')
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure filter is declared using function in: \''+key+'\'.'));var operationSpec=trimmedKey.substring(1).trim();if(operationSpec.length===0)
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \''+key+'\' points to an operation.'));var filter=[operationSpec,value];filter.filter=true;bindings.push(filter);}else if(isCapsuleConstructor(value)){compiled.parts[trimmedKey]={capsule:value};continue;}else if(isDot){if(isString_(value))
bindings.push([trimmedKey,value]);else if(isArray_(value)){for(var bi=0;bi<value.length;bi++){var valueBi=value[bi];if(!isString_(valueBi))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure '+trimmedKey+' array contains only strings.'));bindings.push([trimmedKey,valueBi]);}}else
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure value of '+trimmedKey+' is a string or an array of strings.'));continue;}else if(typeof value==='function'){if(compiled.ownedMethods.indexOf(trimmedKey)!==-1)
throw new Error(Errors.DUPLICATE_NAME.toString(trimmedKey));var visibility=compiled.methodsVisibility[trimmedKey];if(!isNothing_(visibility)){if(visibility===VisibilityType.PUBLIC)
throw new Error(Errors.ILLEGAL_METHODS_VISIBILITY.toString(trimmedKey,'public'));}else{compiled.methodsVisibility[trimmedKey]=VisibilityType.PRIVATE;}
compiled.ownedMethods.push(trimmedKey);compiled.ownedPrivateMethods[trimmedKey]=value;compiled.privateMethods[trimmedKey]=true;continue;}else if(isObject_(value)){if(!isNothing_(value.capsule)||!isNothing_(value.new)||!isNothing_(value.call)){if(!isNothing_(value.capsule)){if(!isCapsuleConstructor(value.capsule))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure part \''+trimmedKey+'\' is a capsule constructor (function).'));}else if(!isNothing_(value.new)){if(typeof value.new!=='function')
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure data \''+trimmedKey+'\' is a constructor (function).'));}else{if(typeof value.call!=='function')
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure data \''+trimmedKey+'\' is a function.'));}
if(!isNothing_(value.deferredArgs)&&typeof value.deferredArgs!=='function')
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure deferredArgs of \''+trimmedKey+'\' is a function.'));var f=value.capsule||value.new||value.call;if(isCapsuleConstructor(f)){compiled.parts[trimmedKey]=value;continue;}}
compiled.data[trimmedKey]=value;}else{compiled.data[trimmedKey]=value;}}
var temp={};checkDuplicates_(temp,compiled.inputs);var pm=Object.keys(compiled.privateMethods);for(var pmi=0;pmi<pm.length;pmi++)
temp[pm[pmi]]=true;checkDuplicates_(temp,compiled.outputs);checkDuplicates_(temp,compiled.hooks);checkDuplicates_(temp,compiled.loops);checkDuplicates_(temp,Object.keys(compiled.publicMethods));checkDuplicates_(temp,Object.keys(compiled.parts));checkDuplicates_(temp,Object.keys(compiled.data));if(!compiled.ownedPrivateMethods.init&&!compiled.ownedPublicMethods.init)
compiled.ownedPrivateMethods.init=defaultInit_;for(var w=0;w<bindings.length;w++){var binding=bindings[w],srcOwner,srcPieceType,srcName;for(var ww=0;ww<binding.length;ww++){var bindingEnd=binding[ww],pieceType,name,owner;if(ww===0&&!isString_(bindingEnd))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure '+bindingEnd+' is a string.'));if(ww!==0&&binding.filter===true)
pieceType=ElementType.FILTER;if(isString_(bindingEnd)){owner=getDefOwner_(bindingEnd);if(!owner||!isString_(owner))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure owner in '+bindingEnd+' is a non-empty string.'));if(owner!=='this'&&!compiled.parts[owner])
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure owner in '+bindingEnd+' is a part name or \'this\'.'));name=getDefName_(bindingEnd);if(!isString_(name)||name.length===0||name===DYNAMIC)
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure name in '+bindingEnd+' is a non-empty string.'));if(owner==='this'&&name.indexOf(DYNAMIC)!==-1)
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('It doesn\'t really make sense to use \'!\' with \'this\'. That is because declarative statements (like the one with \''+bindingEnd+'\') get processed before the constructor.'));if(name.indexOf(DYNAMIC)===0){name=name.substring(DYNAMIC.length);pieceType=ElementType.UNKNOWN;}else if(ww===0||binding.filter!==true){pieceType=getPieceType_(owner,name,compiled);}}
if(ww===0){if(pieceType!==ElementType.INPUT&&pieceType!==ElementType.OUTPUT&&pieceType!==ElementType.HOOK&&pieceType!==ElementType.LOOP&&pieceType!==ElementType.UNKNOWN)
throw new Error(Errors.ELEMENT_NOT_FOUND.toString('Element '+bindingEnd,'neither input and output operations nor hooks and loops'));srcOwner=owner;srcPieceType=pieceType;srcName=name;}else{if(pieceType===ElementType.FILTER){var compiledFilter={};compiledFilter.owner=srcOwner;compiledFilter.name=srcName;compiledFilter.func=bindingEnd;compiled.filters.push(compiledFilter);}else{var compiledBinding={};compiledBinding.owner1=srcOwner;compiledBinding.name1=srcName;compiledBinding.owner2=owner;compiledBinding.name2=name;if(srcPieceType===ElementType.INPUT||srcPieceType===ElementType.OUTPUT){if(pieceType!==ElementType.INPUT&&pieceType!==ElementType.OUTPUT&&pieceType!==ElementType.METHOD&&pieceType!==ElementType.UNKNOWN)
throw new Error(Errors.ELEMENT_NOT_FOUND.toString(bindingEnd,'neither operations nor methods'));if((srcOwner==='this'&&srcPieceType===ElementType.OUTPUT&&pieceType===ElementType.METHOD)||(srcOwner!=='this'&&srcPieceType===ElementType.INPUT&&pieceType===ElementType.METHOD)||(srcOwner==='this'&&owner==='this'&&srcPieceType===pieceType)||(srcOwner!=='this'&&owner!=='this'&&srcPieceType===pieceType)||(srcOwner==='this'&&owner!=='this'&&srcPieceType===ElementType.INPUT&&pieceType===ElementType.OUTPUT)||(srcOwner==='this'&&owner!=='this'&&srcPieceType===ElementType.OUTPUT&&pieceType===ElementType.INPUT)||(srcOwner!=='this'&&owner==='this'&&srcPieceType===ElementType.INPUT&&pieceType===ElementType.OUTPUT)||(srcOwner!=='this'&&owner==='this'&&srcPieceType===ElementType.OUTPUT&&pieceType===ElementType.INPUT))
throw new Error(Errors.WIRE_INCOMPATIBILITY.toString(binding[0],bindingEnd));compiled.wires.push(compiledBinding);}else if(srcPieceType===ElementType.HOOK||srcPieceType===ElementType.LOOP){if(pieceType!==ElementType.HOOK&&pieceType!==ElementType.LOOP&&pieceType!==ElementType.UNKNOWN)
throw new Error(Errors.ELEMENT_NOT_FOUND.toString(bindingEnd,'neither hooks nor loops'));if((srcOwner==='this'&&owner==='this')||(srcOwner==='this'&&owner!=='this'&&srcPieceType!==pieceType)||(srcOwner!=='this'&&owner==='this'&&srcPieceType!==pieceType)||(srcOwner!=='this'&&owner!=='this'&&srcPieceType===pieceType))
throw new Error(Errors.TIE_INCOMPATIBILITY.toString(binding[0],bindingEnd));compiled.ties.push(compiledBinding);}else{if(pieceType===ElementType.OTHER)
throw new Error(Errors.ELEMENT_NOT_FOUND.toString('Element '+bindingEnd,'neither input and output operations nor hooks and loops nor methods'));if(pieceType===ElementType.UNKNOWN)
compiled.unclassified.push(compiledBinding);else if(pieceType===ElementType.INPUT||pieceType===ElementType.OUTPUT||pieceType===ElementType.METHOD)
compiled.wires.push(compiledBinding);else
compiled.ties.push(compiledBinding);}}}}}
return compiled;}
function checkDuplicates_(temp,arr){for(var i=0;i<arr.length;i++){var name=arr[i];if(temp[name])
throw new Error(Errors.DUPLICATE_NAME.toString(name));else
temp[name]=true;}}
function newInterface_(capsule,interfaceElements,Cotr){for(var i=0;i<interfaceElements.length;i++){var name=interfaceElements[i],el=new Cotr(name);capsule[name]=el;}}
function publicMethod_(capsule,var_args){checkContextOrSubCapsule_(capsule);return executeInContext_(this,capsule,capsule,Array.prototype.slice.call(arguments,1));}
function newPublicMethods_(capsule,methods){for(var name in methods)
capsule[name]=publicMethod_.bind(methods[name],capsule);}
function newTargets_(capsule,inputNames){for(var i=0;i<inputNames.length;i++){var inputName=inputNames[i],method=capsule.constructor.prototype[inputName];if(method){var input=getByNameAndType_(capsule._.pins,inputName,'isInput');input._.targets.push(method);}}}
function newParts_(capsule,parts,initArgs){for(var name in parts){var partDef=parts[name],fnCapsule=partDef.capsule||partDef.call||partDef.new,args=getArguments_(partDef,capsule,initArgs),part=fnCapsule.apply(null,args);part._.name=name;capsule[name]=part;}}
function newData_(capsule,data,initArgs){for(var name in data){var dataDef=data[name],datum=dataDef;if(isObject_(dataDef)){var fnData=dataDef.call||dataDef.new;if(typeof fnData==='function'){var args=getArguments_(dataDef,capsule,initArgs),that=null;if(dataDef.new)
that=Object.create(fnData.prototype);datum=fnData.apply(that,args);}}else if(isString_(dataDef)&&dataDef.indexOf(NEW)===0){if(dataDef===New.OBJECT){datum={};}else if(dataDef===New.ARRAY){datum=[];}else if(dataDef===New.MAP){datum=new Map();}else if(dataDef===New.SET){datum=new Set();}else if(dataDef===New.WEAKMAP){datum=new WeakMap();}else if(dataDef===New.WEAKSET){datum=new WeakSet();}}
capsule.setData(name,datum);}}
function newFilters_(capsule,compiledFilters){for(var i=0;i<compiledFilters.length;i++){var compiledFilter=compiledFilters[i],owner=getSelf_(capsule,compiledFilter.owner),operation=getByNameAndType_(owner._.pins,compiledFilter.name);if(isNothing_(operation))
throw new Error(Errors.ELEMENT_NOT_FOUND.toString(compiledFilter.owner+'.'+compiledFilter.name,'operations'));doInContextAndDirection_(function(pipe){this._.exitPipe=pipe;},function(pipe){this._.entryPipe=pipe;},operation,[compiledFilter.func]);}}
function newWires_(capsule,compiledWires){for(var i=0;i<compiledWires.length;i++){var compiledWire=compiledWires[i],owner1=getSelf_(capsule,compiledWire.owner1),operation1=getByNameAndType_(owner1._.pins,compiledWire.name1);if(isNothing_(operation1))
throw new Error(Errors.ELEMENT_NOT_FOUND.toString(compiledWire.owner1+'.'+compiledWire.name1,'operations'));var owner2=getSelf_(capsule,compiledWire.owner2),operation2=getSelfOperationOrMethod_(owner2,compiledWire.name2);if(isNothing_(operation2))
throw new Error(Errors.ELEMENT_NOT_FOUND.toString(compiledWire.owner2+'.'+compiledWire.name2,'neither operations nor methods'));operation1.wire(operation2);}}
function newTies_(capsule,compiledTies){for(var i=0;i<compiledTies.length;i++){var compiledTie=compiledTies[i],owner1=getSelf_(capsule,compiledTie.owner1),hookLoop1=getSelfHookOrLoop_(owner1,compiledTie.name1);if(isNothing_(hookLoop1))
throw new Error(Errors.ELEMENT_NOT_FOUND.toString(compiledTie.owner1+'.'+compiledTie.name1,'neither hooks nor loops'));var owner2=getSelf_(capsule,compiledTie.owner2),hookLoop2=getSelfHookOrLoop_(owner2,compiledTie.name2);if(isNothing_(hookLoop2))
throw new Error(Errors.ELEMENT_NOT_FOUND.toString(compiledTie.owner2+'.'+compiledTie.name2,'neither hooks nor loops'));hookLoop1.tie(hookLoop2);}}
function newUnclassified_(capsule,compiledBindings){for(var i=0;i<compiledBindings.length;i++){var compiledBinding=compiledBindings[i],owner1=getSelf_(capsule,compiledBinding.owner1),operation1=getByNameAndType_(owner1._.pins,compiledBinding.name1),hookLoop1,owner2,operation2,hookLoop2;if(isNothing_(operation1)){hookLoop1=getSelfHookOrLoop_(owner1,compiledBinding.name1);if(isNothing_(hookLoop1))
throw new Error(Errors.ELEMENT_NOT_FOUND.toString(compiledBinding.owner1+'.'+compiledBinding.name1,'neither operations nor hooks and loops'));owner2=getSelf_(capsule,compiledBinding.owner2),hookLoop2=getSelfHookOrLoop_(owner2,compiledBinding.name2);if(isNothing_(hookLoop2))
throw new Error(Errors.ELEMENT_NOT_FOUND.toString(compiledBinding.owner2+'.'+compiledBinding.name2,'neither hooks nor loops'));hookLoop1.tie(hookLoop2);}else{owner2=getSelf_(capsule,compiledBinding.owner2),operation2=getSelfOperationOrMethod_(owner2,compiledBinding.name2);if(isNothing_(operation2))
throw new Error(Errors.ELEMENT_NOT_FOUND.toString(compiledBinding.owner2+'.'+compiledBinding.name2,'neither operations nor methods'));operation1.wire(operation2);}}}
function handleError_(error){var ctxCaps=ctx_;for(;ctxCaps;ctxCaps=ctxCaps._.owner){if(typeof ctxCaps.handle==='function'){return executeInContext_(function(){return ctxCaps.handle(error);},ctxCaps);}else
continue;}
throw error;}
Capsule.prototype.superior=function(){checkCapsuleAsOwner_(this);return this._.superPrototype;};Capsule.prototype.accept=function(visitor,opt_postorder){checkCapsuleAsThis_(this);if(isNothing_(visitor)||typeof visitor.visit!=='function')
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure visitor is an object having visit method.'));if(!opt_postorder)
visitor.visit(this);var parts=this._.parts;for(var i=0;i<parts.length;i++){var part=parts[i];if(typeof part.accept==='function')
executeInContext_(function(v){this.accept(v);},part,part,[visitor]);}
if(opt_postorder)
visitor.visit(this);};Capsule.prototype.getId=function(){checkCapsuleAsThis_(this);return this._.id;};Capsule.prototype.getName=function(){checkCapsuleAsThis_(this);return this._.name;};Capsule.prototype.setName=function(name){checkCapsuleAsThis_(this);checkName_(name);this._.name=name;};Capsule.prototype.getOperations=function(){checkCapsuleAsThis_(this);return this._.pins.slice(0);};Capsule.prototype.getInputs=function(){checkCapsuleAsThis_(this);var inputPins=[],pins=this._.pins;for(var i=0;i<pins.length;i++){if(pins[i]._.isInput)
inputPins.push(pins[i]);}
return inputPins;};Capsule.prototype.getOutputs=function(){checkCapsuleAsThis_(this);var outputPins=[],pins=this._.pins;for(var i=0;i<pins.length;i++){if(!pins[i]._.isInput)
outputPins.push(pins[i]);}
return outputPins;};Capsule.prototype.getHooks=function(){checkCapsuleAsThis_(this);return this._.hooks.slice(0);};Capsule.prototype.getLoops=function(){checkCapsuleAsThis_(this);return this._.loops.slice(0);};Capsule.prototype.attach=function(){checkCapsule_(this);var owner=this._.owner;if(owner){if(owner===ctx_)
return false;else
throw new Error(Errors.CAPSULE_ALREADY_ATTACHED.toString(this._.name));}
this._.owner=ctx_;ctx_._.parts.push(this);onWhat_(this,'onAttach');if(typeof this.onAttach==='function')
executeInContext_(this.onAttach,this,this);return true;};Capsule.prototype.isAttached=function(){checkCapsule_(this);var owner=this._.owner;if(owner){checkContextCapsule_(owner);return true;}else
return false;};Capsule.prototype.detach=function(){checkCapsule_(this);var owner=this._.owner;if(!owner)
return false;checkContextCapsule_(owner);var loops=this.getLoops();for(var i=0;i<loops.length;i++){var lp=loops[i];lp.untieAll();}
var hooks=this.getHooks();for(i=0;i<hooks.length;i++){var hk=hooks[i];hk.untieAll();}
var parts=owner.getParts();for(i=0;i<parts.length;i++)
this.unwire(parts[i]);owner.unwire(this);onWhat_(this,'onDetach');if(typeof this.onDetach==='function')
executeInContext_(this.onDetach,this,this);var ownerData=owner._;this._.owner=null;var ind=ownerData.parts.indexOf(this);if(ind>=0)
ownerData.parts.splice(ind,1);return true;};Capsule.prototype.unwireAll=function(){checkCapsuleAsThis_(this);var operations=this._.pins;for(var i=0;i<operations.length;i++){var op=operations[i];if(!op||!isOperation(op))
continue;op.unwireAll();}};Capsule.prototype.unwire=function(var_args){checkCapsuleAsThis_(this);var arr=arguments[0];if(!isArray_(arr))
arr=arguments;for(var i=0;i<arr.length;i++){var c=arr[i];checkCapsuleAsThis_(c);var areSame=this===c,isThisContext=this===ctx_,caps1Pins=this._.pins,caps2Pins=c._.pins;for(var i=0;i<caps1Pins.length;i++){var pin1=caps1Pins[i],isPin1Input=pin1._.isInput;for(var j=0;j<caps2Pins.length;j++){var pin2=caps2Pins[j];if(!areSame){remove_.call(pin1._.targets,pin2);remove_.call(pin2._.targets,pin1);}else{if(isThisContext){if(isPin1Input)
remove_.call(pin1._.targets,pin2);}else{if(!isPin1Input)
remove_.call(pin1._.targets,pin2);}}}}}};Capsule.prototype.untieAll=function(){checkCapsuleAsThis_(this);var hooksAndLoops=this._.hooks.concat(this._.loops);for(var i=0;i<hooksAndLoops.length;i++){hooksAndLoops[i].untieAll();}};Capsule.prototype.untie=function(var_args){checkCapsuleAsThis_(this);var arr=arguments[0];if(!isArray_(arr))
arr=arguments;for(var i=0;i<arr.length;i++){var c=arr[i];checkCapsuleAsThis_(c);var hooks1=this._.hooks,hooks2=c._.hooks,loops1=this._.loops,loops2=c._.loops,areSiblings=this._.up!==c&&c._.up!==this;if(this._.up===c){unwireCollections_(loops2,loops1);unwireCollections_(hooks1,hooks2);}else if(c._.up===this){unwireCollections_(loops1,loops2);unwireCollections_(hooks2,hooks1);}else{unwireCollections_(hooks2,loops1);unwireCollections_(hooks1,loops2);}}};Capsule.prototype.getFQName=function(sep){checkCapsuleAsThis_(this);return getFQName_(this,sep);};Capsule.prototype.getOperation=function(name){checkCapsuleAsThis_(this);return getByNameAndType_(this._.pins,name);};Capsule.prototype.getInput=function(name){checkCapsuleAsThis_(this);return getByNameAndType_(this._.pins,name,'isInput');};Capsule.prototype.getOutput=function(name){checkCapsuleAsThis_(this);return getByNameAndType_(this._.pins,name,'isOutput');};Capsule.prototype.getHook=function(name){checkCapsuleAsThis_(this);return getByNameAndType_(this._.hooks,name);};Capsule.prototype.getLoop=function(name){checkCapsuleAsThis_(this);return getByNameAndType_(this._.loops,name);};Capsule.prototype.getData=function(id){checkCapsuleAsOwner_(this);if(!isString_(id))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure id is a string.'));return this._.data[id];};Capsule.prototype.setData=function(id,data){checkCapsuleAsOwner_(this);if(!isString_(id))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure id is a string.'));this._.data[id]=data;};Capsule.prototype.detachAll=function(){checkCapsuleAsOwner_(this);var parts=this.getParts();if(isArray_(parts))
for(var i=0;i<parts.length;i++){parts[i].detach();}};Capsule.prototype.getPart=function(name){checkCapsuleAsOwner_(this);return getByNameAndType_(this._.parts,name);};Capsule.prototype.getParts=function(){checkCapsuleAsOwner_(this);return this._.parts.slice(0);};Capsule.prototype.getCurrentOperation=function(){checkCapsuleAsOwner_(this);return this._.currentOperation;}
var msgQue_={head:null,tail:null,},msgQueAux_={head:null,tail:null,},postProcessingList_=[],messagesTimeoutID_=null;function getBackwardOperations_(pin){var results=[],candidates=ctx_.getInputs(),parts=ctx_.getParts(),candidate,i;for(i=0;i<parts.length;i++){[].push.apply(candidates,parts[i].getOutputs());}
for(i=0;i<candidates.length;i++){candidate=candidates[i];if(candidate._.targets.indexOf(pin)!==-1)
results.push(candidate);}
return results;}
function doInContextAndDirection_(srcFunction,dstFunction,operation,args){if(operation._.owner===ctx_){if(operation._.isInput){return srcFunction.apply(operation,args);}else{return dstFunction.apply(operation,args);}}else if(operation._.owner._.owner===ctx_){if(operation._.isInput){return dstFunction.apply(operation,args);}else{return srcFunction.apply(operation,args);}}else{checkOperationAsThis_(operation);}}
function wireThisToSourcesAt_(at,var_args){if(typeof at!=='number')
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure at is a number.'));for(var i=1;i<arguments.length;i++){oProto_.targetAt.apply(arguments[i],[at,this]);}}
function applyPipe_(arrPipe,args,context){if(isNothing_(arrPipe))
return args;else if(arrPipe===STOP)
return STOP;else if(isArray_(arrPipe)){return arrPipe.slice(0);}else if(typeof arrPipe==='function'){args=executeInContext_(function(){return arrPipe.apply(ctx_,args);},context);if(args!==STOP&&!isArray_(args))
throw new Error(Errors.ILLEGAL_FILTERS_RETURN_VALUE.toString());return args;}else
throw new Error(Errors.ERROR.toString(' (1)'));}
function signOnForPostProcessing(fn){if(typeof fn!=='function')
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure the \'fn\' argument is a function.'));postProcessingList_.push(fn);}
function signOffForPostProcessing(fn){if(typeof fn!=='function')
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure the \'fn\' argument is a function.'));postProcessingList_.splice(postProcessingList_.indexOf(fn),1);}
function postProcessing_(){var arr=postProcessingList_;for(var i=0;i<arr.length;i++){var fn=arr[i];if(typeof fn==='function')
fn();}}
function setTimeoutForMessages_(){if(!messagesTimeoutID_)
messagesTimeoutID_=setTimeout(function(){clearTimeout(messagesTimeoutID_);messagesTimeoutID_=null;processMessageQueue_();},0);}
function processMessageQueue_(){var msgExists;do{msgExists=processOneMsg_();}while(msgExists);postProcessing_();}
function processOneMsg_(){if(msgQueAux_.tail){msgQueAux_.tail.next=msgQue_.head;msgQue_.head=msgQueAux_.head;if(!msgQue_.tail)
msgQue_.tail=msgQueAux_.tail;}
msgQueAux_.head=msgQueAux_.tail=null;if(!msgQue_.head)
return false;var msg=msgQue_.head;msgQue_.head=msg.next;if(!msg.next)
msgQue_.tail=null;msg.next=null;if(!msg.pin||!isOperation(msg.pin))
throw new Error(Errors.ERROR.toString(' (2)'));try{msg.resolve(operationImplNoContextCheck_(msg.pin,msg.msg));}catch(e){msg.reject(e);}
return true;}
function receive_(pin,args,retVal){if(!pin._.entryEnabled)
return;var newContext,curContext;if(pin._.isInput){newContext=pin._.owner;curContext=newContext._.owner;}else{curContext=pin._.owner;newContext=curContext._.owner;}
pin._.entryLastVal=args;args=applyPipe_(pin._.entryPipe,args,curContext);if(args===STOP||args[0]===STOP)
return;if(!pin._.exitEnabled)
return;args=applyPipe_(pin._.exitPipe,args,newContext);if(args===STOP||args[0]===STOP)
return;pin._.exitLastVal=args;var targets=pin._.targets;if(!targets||!isArray_(targets))
throw new Error(Errors.ERROR.toString(' (3)'));if(targets.length===0)
return;targets=targets.slice(0);for(var i=0;i<targets.length;i++){var r=targets[i];if(isOperation(r)){receive_(r,args,retVal);}else if(typeof r==='function'){ctx_._.currentOperation=pin;var result=executeInContext_(function(){return r.apply(ctx_,args);},newContext);ctx_._.currentOperation=null;retVal.push(result);}else
throw new Error(Errors.ERROR.toString(' (4)'));}}
function wire(oper1,oper2){if(isOperation(oper1))
oper1.wire(oper2);else if(isOperation(oper2))
oper2.wire(oper1);else
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure either oper1 or oper2 is an operation.'));}
function unwire(oper1,oper2){if(isOperation(oper1))
oper1.unwire(oper2);else if(isOperation(oper2))
oper2.unwire(oper1);else
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure either oper1 or oper2 is an operation.'));}
function operationImpl_(operation,args){if(!operation._.isInput)
checkContextProperty_(operation);else
checkContextOrSubProperty_(operation);return operationImplNoContextCheck_(operation,args);}
function operationImplNoContextCheck_(operation,args){var retVal=[];receive_(operation,args,retVal);if(operation._.unpack&&retVal.length<2)
return retVal.length===1?retVal[0]:undefined;else
return retVal;}
function sendNoCheck_(operation,args){return new Promise(function(resolve,reject){var m={pin:operation,msg:args,context:ctx_,resolve:resolve,reject:reject};var que=msgQueAux_;if(!que.tail)
que.head=m;else
que.tail.next=m;que.tail=m;m.next=null;setTimeoutForMessages_();});}
Operation.prototype.getId=function(){checkOperationAsThis_(this);return this._.id;};Operation.prototype.getOwner=function(){checkOperationAsThis_(this);return this._.owner;};Operation.prototype.getName=function(){checkOperationAsThis_(this);return this._.name;};Operation.prototype.setName=function(name){checkOperation_(this);checkContextProperty_(this);checkName_(name);this._.name=name;};Operation.prototype.getFQName=function(sep){checkOperationAsThis_(this);return getFQName_(this,sep);};Operation.prototype.isInput=function(){checkOperationAsThis_(this);return this._.isInput;};Operation.prototype.isOutput=function(){checkOperationAsThis_(this);return!(this._.isInput);};Operation.prototype.isPublic=function(){checkOperation_(this);return doInContext_(true,false,this,arguments);};Operation.prototype.getLastArguments=function(opt_beforeFiltering){checkOperationAsThis_(this);if(opt_beforeFiltering)
return this._.entryLastVal;else
return this._.exitLastVal;};Operation.prototype.setUnpackResult=function(unpack){checkOperationAsThis_(this);this._.unpack=unpack;};Operation.prototype.isUnpackResult=function(){checkOperationAsThis_(this);return this._.unpack;};Operation.prototype.getFilter=function(){checkOperationAsThis_(this);return doInContextAndDirection_(function(){return this._.exitPipe;},function(){return this._.entryPipe;},this);};Operation.prototype.setFilter=function(var_args){checkOperationAsThis_(this);var pipe;if(arguments.length===1){if(isNothing_(arguments[0])||typeof arguments[0]==='function'||arguments[0]===STOP)
pipe=arguments[0];else
pipe=[arguments[0]];}else{pipe=[];for(var i=0;i<arguments.length;i++)
pipe[i]=arguments[i];}
doInContextAndDirection_(function(){this._.exitPipe=pipe;},function(){this._.entryPipe=pipe;},this);};Operation.prototype.isEnabled=function(){checkOperationAsThis_(this);return doInContextAndDirection_(function(){return this._.exitEnabled;},function(){return this._.entryEnabled;},this);};Operation.prototype.setEnabled=function(enabled){checkOperationAsThis_(this);doInContextAndDirection_(function(){this._.exitEnabled=!!enabled;},function(){this._.entryEnabled=!!enabled;},this);};Operation.prototype.disclose=function(opt_name){checkOperation_(this);checkContextSubProperty_(this);var newPin;if(this._.isInput)
newPin=new Input(opt_name);else
newPin=new Output(opt_name);newPin.wire(this);if(opt_name)
ctx_[opt_name]=newPin;return newPin;};Operation.prototype.wire=function(var_args){checkOperation_(this);doInContextAndDirection_(oProto_.target,oProto_.source,this,arguments);};Operation.prototype.wireAt=function(at,var_args){checkOperation_(this);doInContextAndDirection_(oProto_.targetAt,wireThisToSourcesAt_,this,arguments);};Operation.prototype.isWiredTo=function(var_args){checkOperation_(this);return doInContextAndDirection_(oProto_.isSourceOf,oProto_.isTargetOf,this,arguments);};Operation.prototype.getWires=function(){checkOperation_(this);return doInContextAndDirection_(oProto_.getTargets,oProto_.getSources,this,arguments);};Operation.prototype.unwireAll=function(){checkOperation_(this);doInContextAndDirection_(oProto_.untargetAll,oProto_.unsourceAll,this,arguments);};Operation.prototype.unwire=function(var_args){checkOperation_(this);doInContextAndDirection_(oProto_.untarget,oProto_.unsource,this,arguments);};Operation.prototype.rewire=function(var_args){checkOperation_(this);doInContextAndDirection_(oProto_.retarget,oProto_.resource,this,arguments);};Operation.prototype.getSources=function(){checkOperationFunAsTarget_(this);return getBackwardOperations_(this);};Operation.prototype.isTargetOf=function(var_args){checkOperationAsTarget_(this);checkOperationsAsSources_.apply(this,arguments);var result=true;for(var i=0;i<arguments.length;i++)
result=result&&arguments[i]._.targets.indexOf(this)!==-1;return result;};Operation.prototype.source=function(var_args){checkOperationAsTarget_(this);checkOperationsAsSources_.apply(this,arguments);var arr=arguments[0];if(!isArray_(arr))
arr=arguments;for(var i=0;i<arr.length;i++)
add_.call(arr[i]._.targets,this);};Operation.prototype.unsourceAll=function(){checkOperationAsTarget_(this);var sources=getBackwardOperations_(this);for(var i=0;i<sources.length;i++)
remove_.call(sources[i]._.targets,this);};Operation.prototype.unsource=function(var_args){checkOperationAsTarget_(this);checkOperationsAsSources_.apply(this,arguments);var arr=arguments[0];if(!isArray_(arr))
arr=arguments;for(var i=0;i<arr.length;i++)
remove_.call(arr[i]._.targets,this);};Operation.prototype.resource=function(var_args){oProto_.unsourceAll.call(this);oProto_.source.apply(this,arguments);};Operation.prototype.getTargets=function(){checkOperationAsSource_(this);return get_.apply(this._.targets);};Operation.prototype.isSourceOf=function(var_args){checkOperationAsSource_(this);checkOperationsFunsAsTargets_.apply(this,arguments);var result=true;for(var i=0;i<arguments.length;i++)
result=result&&this._.targets.indexOf(arguments[i])!==-1;return result;};Operation.prototype.target=function(var_args){checkOperationAsSource_(this);checkOperationsFunsAsTargets_.apply(this,arguments);add_.apply(this._.targets,arguments);};Operation.prototype.targetAt=function(at,var_args){checkOperationAsSource_(this);checkOperationsFunsAsTargets_.apply(this,Array.prototype.slice.call(arguments,1));addAt_.apply(this._.targets,arguments);};Operation.prototype.untargetAll=function(){checkOperationAsSource_(this);clear_.apply(this._.targets);};Operation.prototype.untarget=function(var_args){checkOperationAsSource_(this);checkOperationsFunsAsTargets_.apply(this,arguments);remove_.apply(this._.targets,arguments);};Operation.prototype.retarget=function(var_args){checkOperationAsSource_(this);checkOperationsFunsAsTargets_.apply(this,arguments);clear_.apply(this._.targets);add_.apply(this._.targets,arguments);};Operation.prototype.send=function(var_args){checkOperation_(this);if(!this._.isInput)
checkContextProperty_(this);else
checkContextOrSubProperty_(this);return sendNoCheck_(this,arguments);};var onHookDefault_=function(hookElement,loopElement,afterElement,classes){},offHookDefault_=function(hookElement,loopElement,classes){},setClassesDefault_=function(loopElement,classes){};function disclose_(hkLp,name){var newHkLp;if(isLoop(hkLp)){newHkLp=new Loop(name);}else{newHkLp=new Hook(name);}
hkLp.tie(newHkLp);if(name)
ctx_[name]=newHkLp;return newHkLp;}
function setDefaultElementHandlers(onHook,offHook,setClasses){if(typeof onHook!=='function')
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'onHook\' is a function.'));if(typeof offHook!=='function')
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'offHook\' is a function.'));if(typeof setClasses!=='function')
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'setClasses\' is a function.'));onHookDefault_=onHook;offHookDefault_=offHook;setClassesDefault_=setClasses;}
function getTopmost_(hkLp){for(;hkLp._.up;hkLp=hkLp._.up){}
return hkLp;}
function getFirstLeaveLoopOfLoop_(currLoop){var down=currLoop._.down;if(down)
return getFirstLeaveLoopOfLoop_(down);else if(currLoop._.el)
return currLoop;else
return null;}
function getFirstLeaveLoopOfHook_(currHook){for(var i=0;i<currHook._.children.length;i++){var child=currHook._.children[i];var result=getFirstLeaveLoop_(child);if(result)
return result;}
return null;}
function getFirstLeaveLoop_(hkLp){if(isLoop(hkLp))
return getFirstLeaveLoopOfLoop_(hkLp);else
return getFirstLeaveLoopOfHook_(hkLp);}
function getLeaveLoopsOfLoop_(currLoop,loops){var down=currLoop._.down;if(down)
getLeaveLoopsOfLoop_(down,loops);else if(currLoop._.el)
loops.push(currLoop);else
return;}
function getLeaveLoopsOfHook_(currHook,loops){for(var i=0;i<currHook._.children.length;i++){var child=currHook._.children[i];getLeaveLoops_(child,loops);}}
function getLeaveLoops_(hkLp,loops){if(isLoop(hkLp))
return getLeaveLoopsOfLoop_(hkLp,loops);else
return getLeaveLoopsOfHook_(hkLp,loops);}
function getNextLoop_(top,bot,at){if(!top||!bot)
return null;if(typeof at==='number'){for(var i=at;i<top._.children.length;i++){var result=getFirstLeaveLoop_(top._.children[i]);if(result)
return result;}}
return getNextLoop_(top._.up,top,isHook(top._.up)?top._.up._.children.indexOf(top)+1:null);}
function propagateEvent_(hkLp,eventType){for(;hkLp._.up;hkLp=hkLp._.up){var fnToExecute=hkLp._[eventType];if(fnToExecute)
executeInContext_(fnToExecute,hkLp._.owner,hkLp._.owner);}}
function getClasses_(loop){var classes=[],hkLp=loop;for(;hkLp._.up;hkLp=hkLp._.up){if(isHook(hkLp)&&isString_(hkLp._.cls))
classes.splice(0,0,hkLp._.cls);}
return classes;}
function tieTopBot_(top,bot,at){var nextLoop=getNextLoop_(top,bot,at);if(isLoop(top)&&isLoop(bot)){top._.down=bot;}else if(isHook(top)&&(isLoop(bot)||isHook(bot))&&typeof at==='number'){top._.children.splice(at,0,bot);}else{top._.children.push(bot);}
bot._.up=top;var loops=[];getLeaveLoops_(bot,loops);var topmost=getTopmost_(top);if(isHook(topmost)&&topmost._.el){for(var i=0;i<loops.length;i++){onHookDefault_(topmost._.el,loops[i]._.el,nextLoop?nextLoop._.el:null,getClasses_(loops[i]));propagateEvent_(loops[i],'onHook');}}}
function untieTopBot_(top,bot){if(isLoop(top)&&isLoop(bot)&&top._.down===bot&&bot._.up===top){top._.down=null;}else if(isHook(top)&&(isLoop(bot)||isHook(bot))&&top._.children.indexOf(bot)>=0&&bot._.up===top){top._.children.splice(top._.children.indexOf(bot),1);}else
return;bot._.up=null;var loops=[];getLeaveLoops_(bot,loops);var topmost=getTopmost_(top);if(isHook(topmost)&&topmost._.el){for(var i=0;i<loops.length;i++){offHookDefault_(topmost._.el,loops[i]._.el,getClasses_(loops[i]).concat(getClasses_(top)));propagateEvent_(loops[i],'offHook');propagateEvent_(top,'offHook');}}
if(isLoop(bot)){var ref=bot._.ref;if(ref)
ref.detach();bot._.ref=null;}}
function unwireCollections_(parents,children){var i,j;for(i=0;i<children.length;i++){var c=children[i];for(j=0;j<parents.length;j++){var p=parents[j];if(c._.up===p)
untieTopBot_(p,c);}}}
function tie(hkLp1,hkLp2){checkHookLoop_(hkLp1);hkLp1.tie(hkLp2);}
function untie(hkLp1,hkLp2){checkHookLoop_(hkLp1);hkLp1.untie(hkLp2);}
Hook.prototype.getId=function(){checkHookAsThis_(this);return this._.id;};Hook.prototype.setEventHandlers=function(onHook,offHook){if(onHook&&typeof onHook!=='function')
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'onHook\' is a function or null.'));if(offHook&&typeof offHook!=='function')
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'offHook\' is a function or null.'));checkHookAsChild_(this);this._.onHook=onHook;this._.offHook=offHook;};Hook.prototype.setClass=function(cls){if(!isNothing_(cls)&&(!isString_(cls)||cls.length===0))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure if not null \'cls\' is a non-empty string.'));checkHookAsChild_(this);this._.cls=cls;var topmost=getTopmost_(this);if(isHook(topmost)&&topmost._.el){var loops=[];getLeaveLoops_(this,loops);for(var i=0;i<loops.length;i++)
setClassesDefault_(loops[i]._.el,getClasses_(loops[i]));}};Hook.prototype.getOwner=function(){checkHookAsThis_(this);return this._.owner;};Hook.prototype.getName=function(){checkHookAsThis_(this);return this._.name;};Hook.prototype.setName=function(name){checkHookAsChild_(this);checkName_(name);this._.name=name;};Hook.prototype.getFQName=function(sep){checkHookAsThis_(this);return getFQName_(this,sep);};Hook.prototype.isPublic=function(){checkHook_(this);return doInContext_(true,false,this,arguments);};Hook.prototype.getHooks=function(){checkHookAsParent_(this);return get_.apply(this._.children);};Hook.prototype.hook=function(var_args){checkHook_(this);Hook.prototype.hookAt.apply(this,[this._.children.length].concat(Array.prototype.slice.call(arguments,0)));};Hook.prototype.hookAt=function(at,var_args){checkHookAsParent_(this);checkBounds_(at,this._.children.length,'at');checkHookLoopAsChildren_.apply(this,Array.prototype.slice.call(arguments,1));var skip=0,arr=arguments[1];if(!isArray_(arr)){skip=1;arr=arguments;}
for(var i=arr.length-1;i>=skip;i--){untieTopBot_(arr[i]._.up,arr[i]);tieTopBot_(this,arr[i],at);}};Hook.prototype.isHookOf=function(var_args){checkHookAsParent_(this);var arr=arguments[0];if(!isArray_(arr))
arr=arguments;var result=true;for(var i=0;i<arr.length;i++){checkHookLoopAsChild_(arr[i]);result=result&&arr[i]._.up===this;}
return result;};Hook.prototype.unhookAll=function(){checkHookAsParent_(this);var children=this._.children.slice(0);for(var i=0;i<children.length;i++)
untieTopBot_(this,children[i]);};Hook.prototype.unhook=function(var_args){checkHookAsParent_(this);checkHookLoopAsChildren_.apply(this,arguments);var arr=arguments[0];if(!isArray_(arr))
arr=arguments;for(var i=0;i<arr.length;i++)
untieTopBot_(this,arr[i]);};Hook.prototype.rehook=function(var_args){Hook.prototype.unhookAll.apply(this);Hook.prototype.hook.apply(this,arguments);};Hook.prototype.getHook=function(){checkHookAsChild_(this);return this._.up;};Hook.prototype.setHook=function(hook){checkHookAsChild_(this);var oldParent=this._.up;if(oldParent)
untieTopBot_(oldParent,this);if(hook){checkHookAsParent_(hook);tieTopBot_(hook,this);}};Hook.prototype.getTies=function(){checkHook_(this);var that=this;return doInContext_(function(){return that._.up?[that._.up]:[];},Hook.prototype.getHooks,this,arguments);};Hook.prototype.tie=function(var_args){checkHook_(this);var args=arguments[0],that=this;if(!isArray_(args))
args=arguments;doInContext_(function(){var arg=args[0];if(arg!=null)
checkHook_(arg);that.setHook(arg);},Hook.prototype.hook,this,arguments);};Hook.prototype.tieAt=function(at,var_args){checkHook_(this);var that=this,arg=arguments[1];if(isArray_(arg))
arg=arg[0];doInContext_(function(){checkHook_(arg);arg.hookAt(at,that);},Hook.prototype.hookAt,this,arguments);};Hook.prototype.isTiedTo=function(var_args){checkHook_(this);var args=arguments[0],that=this;if(!isArray_(args))
args=arguments;return doInContext_(function(){var arg=args[0];if(arg!=null)
checkHook_(arg);return that._.up===arg;},function(){var result=true;for(var i=0;i<args.length;i++){checkHookLoop_(args[i]);result=result&&args[i]._.up===that;}
return result;},this,arguments);};Hook.prototype.untieAll=function(){checkHook_(this);doInContext_(Hook.prototype.setHook,Hook.prototype.unhookAll,this,[null]);};Hook.prototype.untie=function(var_args){checkHook_(this);var args=arguments[0],that=this;if(!isArray_(args))
args=arguments;doInContext_(function(){var arg=args[0];if(arg!=null){checkHook_(arg);if(that._.up===arg)
that.setHook(null);}},Hook.prototype.unhook,this,arguments);};Hook.prototype.retie=function(var_args){checkHook_(this);var args=arguments[0],that=this;if(!isArray_(args))
args=arguments;doInContext_(function(){var arg=args[0];if(arg!=null)
checkHook_(arg);that.setHook(arg);},Hook.prototype.rehook,this,arguments);};Hook.prototype.disclose=function(opt_name){checkHookAsChild_(this);return disclose_(this,opt_name);};Loop.prototype.getId=function(){checkLoopAsThis_(this);return this._.id;};Loop.prototype.setEventHandlers=function(onHook,offHook){if(onHook&&typeof onHook!=='function')
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'onHook\' is a function or null.'));if(offHook&&typeof offHook!=='function')
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'offHook\' is a function or null.'));checkLoopAsParent_(this);this._.onHook=onHook;this._.offHook=offHook;};Loop.prototype.getOwner=function(){checkLoopAsThis_(this);return this._.owner;};Loop.prototype.getName=function(){checkLoopAsThis_(this);return this._.name;};Loop.prototype.setName=function(name){checkLoopAsParent_(this);checkName_(name);this._.name=name;};Loop.prototype.getFQName=function(opt_sep){checkLoopAsThis_(this);return getFQName_(this,opt_sep);};Loop.prototype.isPublic=function(){checkLoop_(this);return doInContext_(true,false,this,arguments);};Loop.prototype.render=function(to){checkLoopAsChild_(this);var ref=this._.ref;if(ref)
ref.detach();var newRef=new ElementRef(to);this._.ref=newRef;newRef.hook.hook(this);};Loop.prototype.getHook=function(){checkLoopAsChild_(this);var up=this._.up;if(isHook(up))
return up;return null;};Loop.prototype.setHook=function(hook){checkLoopAsChild_(this);if(hook)
checkHookAsParent_(hook);untieTopBot_(this._.up,this);if(hook)
tieTopBot_(hook,this);};Loop.prototype.getPublicLoop=function(){checkLoopAsChild_(this);var up=this._.up;if(isLoop(up))
return up;return null;};Loop.prototype.setPublicLoop=function(loop){checkLoopAsChild_(this);if(loop)
checkLoopAsParent_(loop);untieTopBot_(this._.up,this);if(loop){untieTopBot_(loop,loop._.down);tieTopBot_(loop,this);}};Loop.prototype.getPrivateLoop=function(){checkLoopAsParent_(this);return this._.down;};Loop.prototype.setPrivateLoop=function(loop){checkLoopAsParent_(this);if(loop)
checkLoopAsChild_(loop);untieTopBot_(this,this._.down);if(loop){untieTopBot_(loop._.up,loop);tieTopBot_(this,loop);}};Loop.prototype.getParent=function(){checkLoopAsChild_(this);return this._.up;};Loop.prototype.setParent=function(parent){checkLoopAsChild_(this);if(parent)
checkHookLoopAsParent_(parent);untieTopBot_(this._.up,this);if(parent){if(isLoop(parent))
untieTopBot_(parent,parent._.down);tieTopBot_(parent,this);}};Loop.prototype.getLoop=function(){checkLoop_(this);return doInContext_(Loop.prototype.getPrivateLoop,Loop.prototype.getPublicLoop,this,arguments);};Loop.prototype.setLoop=function(loop){checkLoop_(this);doInContext_(Loop.prototype.setPrivateLoop,Loop.prototype.setPublicLoop,this,arguments);};Loop.prototype.getTies=function(){checkLoop_(this);var that=this;return doInContext_(function(){return that._.down?[that._.down]:[];},function(){return that._.up?[that._.up]:[];},this);};Loop.prototype.tie=function(hookOrLoop){checkLoop_(this);var that=this,arg=arguments[0];if(isArray_(arg))
arg=arg[0];doInContext_(function(){if(arg!=null)
checkLoop_(arg);that.setPrivateLoop(arg);},function(){if(arg!=null)
checkHookLoop_(arg);that.setParent(arg);},this,arguments);};Loop.prototype.tieAt=function(at,hookOrLoop){checkLoop_(this);var that=this,arg=arguments[1];if(isArray_(arg))
arg=arg[0];doInContext_(function(){if(at!==0)
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'at\' is zero since you should be tying two loops.'));if(arg!=null)
checkLoop_(arg);that.setPrivateLoop(arg);},function(){if(arg!=null)
checkHookLoop_(arg);if(isLoop(arg)&&at!==0)
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'at\' is zero since you are tying two loops.'));if(isHook(arg))
arg.hookAt(at,that);else
that.setPublicLoop(arg);},this,arguments);};Loop.prototype.isTiedTo=function(hookOrLoop){checkLoop_(this);var that=this,arg=arguments[0];if(isArray_(arg))
arg=arg[0];return doInContext_(function(){if(arg!=null)
checkLoop_(arg);return that._.down===arg;},function(){if(arg!=null)
checkHookLoop_(arg);return that._.up===arg;},this,arguments);};Loop.prototype.untieAll=function(){checkLoop_(this);doInContext_(Loop.prototype.setPrivateLoop,Loop.prototype.setParent,this,[null]);};Loop.prototype.untie=function(hookOrLoop){checkLoop_(this);var that=this,arg=arguments[0];if(isArray_(arg))
arg=arg[0];doInContext_(function(){if(arg!=null){checkLoop_(arg);if(that._.down===arg)
that.setPrivateLoop(null);}},function(){if(arg!=null){checkHookLoop_(arg);if(that._.up===arg)
that.setParent(null);}},this,arguments);};Loop.prototype.retie=function(hookOrLoop){checkLoop_(this);var that=this,arg=arguments[0];if(isArray_(arg))
arg=arg[0];doInContext_(function(){if(arg!=null)
checkLoop_(arg);that.setPrivateLoop(arg);},function(){if(arg!=null)
checkHookLoop_(arg);that.setParent(arg);},this,arguments);};Loop.prototype.disclose=function(opt_name){checkLoopAsChild_(this);return disclose_(this,opt_name);};function areAllStrings_(arr){for(var i=0;i<arr.length;i++){if(!isString_(arr[i]))
return false;}
return true;}
function isArguments_(obj){return Object.prototype.toString.call(obj)==='[object Arguments]';}
var isArray_=(function(){if(Array.isArray){return Array.isArray;}
var objectToStringFn=Object.prototype.toString,arrayToStringResult=objectToStringFn.call([]);return function(subject){return objectToStringFn.call(subject)===arrayToStringResult;};}
());function isCapsule(obj){return obj instanceof Capsule;}
function isCapsuleConstructor(func){for(var f=func;f;f=f.super$)
if(f!==Capsule)
continue;else
return true;return false;}
var CONTEXT_CHECK_ENABLED=true;function isContext_(capsule){return CONTEXT_CHECK_ENABLED&&ctx_===capsule;}
function isForbidden_(str){return str&&(str.indexOf('.')!==-1||str.indexOf(SEP)!==-1);}
function isFunction_(fnName,def,Base){if(def&&typeof def[fnName]==='function')
return true;if(Base)
return typeof Base.prototype[fnName]==='function';return false;}
function isHook(hook){return hook instanceof Hook;}
function isHookOrLoop_(obj){return isLoop(obj)||isHook(obj);}
function isLoop(loop){return loop instanceof Loop;}
function isNothing_(obj){return obj===null||obj===undefined;}
function isNumber_(obj){return typeof obj==='number';}
function isObject_(obj){return obj&&typeof obj==='object'&&!isArray_(obj);}
function isOperation(obj){return typeof obj==='function'&&isObject_(obj._);}
function isString_(obj){return typeof obj==='string';}
function checkBounds_(val,boundInclusive,valStr){if(typeof val==='number'){if(val<0||val>boundInclusive)
throw new Error(Errors.INDEX_OUT_OF_BOUNDS.toString(valStr,val,boundInclusive));}else if(val)
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure'+valStr+' is a number.'));else
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure '+valStr+' is provided.'));}
function checkCapsule_(obj){if(!isCapsule(obj))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'this\' is a capsule.'));}
function checkCapsuleAsOwner_(obj){checkCapsule_(obj);checkContextCapsule_(obj);}
function checkCapsuleAsThis_(obj){checkCapsule_(obj);checkContextOrSubCapsule_(obj);}
function checkContextCapsule_(capsule){if(!isContext_(capsule))
throw new Error(Errors.OUT_OF_CONTEXT.toString());}
function checkContextSubCapsule_(capsule){checkContextCapsule_(getOwner_(capsule));}
function checkContextOrSubCapsule_(capsule){if(isContext_(capsule))
return;checkContextSubCapsule_(capsule);}
function checkContextProperty_(prop){checkContextCapsule_(getOwner_(prop));}
function checkContextSubProperty_(prop){checkContextSubCapsule_(getOwner_(prop));}
function checkContextOrSubProperty_(prop){checkContextOrSubCapsule_(getOwner_(prop));}
function checkFilters_(){var arr=arguments[0];if(!isArray_(arr))
arr=arguments;for(var i=0;i<arr.length;i++)
if(typeof arr[i]!=='function')
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure the argument is a function.'));}
function checkHook_(obj){if(!isHook(obj))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure you use hook here.'));}
function checkHookAsChild_(hook){checkHook_(hook);checkContextProperty_(hook);}
function checkHookAsParent_(hook){checkHook_(hook);checkContextSubProperty_(hook);}
function checkHookAsThis_(obj){checkHook_(obj);checkContextOrSubProperty_(obj);}
function checkHookLoop_(obj){if(!isHookOrLoop_(obj))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure you use hook or loop here.'));}
function checkHookLoopAsChild_(hkLp){if(isHook(hkLp))
checkContextProperty_(hkLp);else if(isLoop(hkLp))
checkContextSubProperty_(hkLp);else
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure you use either a hook or a loop here.'));}
function checkHookLoopAsChildren_(){var arr=arguments[0];if(!isArray_(arr))
arr=arguments;for(var i=0;i<arr.length;i++){checkHookLoopAsChild_(arr[i]);}}
function checkHookLoopAsParent_(hkLp){if(isLoop(hkLp))
checkContextProperty_(hkLp);else if(isHook(hkLp))
checkContextSubProperty_(hkLp);else
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure you use either a hook or a loop here.'));}
function checkLoop_(obj){if(!isLoop(obj))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure you use loop here.'));}
function checkLoopAsChild_(loop){checkLoop_(loop);checkContextSubProperty_(loop);}
function checkLoopAsParent_(loop){checkLoop_(loop);checkContextProperty_(loop);}
function checkLoopAsThis_(obj){checkLoop_(obj);checkContextOrSubProperty_(obj);}
function checkName_(name){if(!isString_(name))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure the name argument is a string.'));if(isForbidden_(name))
throw new Error(Errors.FORBIDDEN_NAME.toString('the name argument'));}
function checkOperation_(obj){if(!isOperation(obj))
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure you use operation here.'));}
function checkOperationAsSource_(pin){checkOperation_(pin);checkContextOrSubProperty_(pin);if((ctx_===pin._.owner&&!pin._.isInput)||(ctx_===pin._.owner._.owner&&pin._.isInput))
throw new Error(Errors.ILLEGAL_OPERATION_TYPE.toString(pin._.name,'source'));}
function checkOperationsAsSources_(){var arr=arguments[0];if(!isArray_(arr))
arr=arguments;for(var i=0;i<arr.length;i++){checkOperationAsSource_(arr[i]);}}
function checkOperationAsTarget_(op){checkOperation_(op);checkContextOrSubProperty_(op);checkTarget_(op);}
function checkOperationAsThis_(obj){checkOperation_(obj);checkContextOrSubProperty_(obj);}
function checkOperationFunAsTarget_(pinFun){if(isOperation(pinFun)){checkContextOrSubProperty_(pinFun);checkTarget_(pinFun);}else if(typeof pinFun!=='function'){throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure the argument is either an operation or a function.'));}}
function checkOperationsFunsAsTargets_(){var arr=arguments[0];if(!isArray_(arr))
arr=arguments;for(var i=0;i<arr.length;i++){checkOperationFunAsTarget_(arr[i]);}}
function checkTarget_(op){if((ctx_===op._.owner&&op._.isInput)||(ctx_===op._.owner._.owner&&!op._.isInput))
throw new Error(Errors.ILLEGAL_OPERATION_TYPE.toString(op._.name,'target'));}
function getPieceType_(owner,name,compiled,in1,in2){var targetCompiledDef;if(owner==='this'){targetCompiledDef=compiled;}else{var part=compiled.parts[owner];if(isCapsuleConstructor(part))
targetCompiledDef=part.compiledDef;else if(isCapsuleConstructor(part.capsule))
targetCompiledDef=part.capsule.compiledDef;else if(isCapsuleConstructor(part.new))
targetCompiledDef=part.new.compiledDef;else
targetCompiledDef=part.call.compiledDef;}
if(targetCompiledDef['inputs'].indexOf(name)>-1)
return ElementType.INPUT;else if(targetCompiledDef['outputs'].indexOf(name)>-1)
return ElementType.OUTPUT;else if(targetCompiledDef['hooks'].indexOf(name)>-1)
return ElementType.HOOK;else if(targetCompiledDef['loops'].indexOf(name)>-1)
return ElementType.LOOP;else if(Object.keys(targetCompiledDef['privateMethods']).indexOf(name)>-1)
return ElementType.METHOD;else if(Object.keys(targetCompiledDef['publicMethods']).indexOf(name)>-1)
return ElementType.METHOD;else
return ElementType.OTHER;}
function getArguments_(def,capsule,initArgs){var args;if(def.hasOwnProperty('arguments')){args=def.arguments;}else if(def.hasOwnProperty('args')){args=def.args;}else if(def.hasOwnProperty('deferredArgs')){args=def.deferredArgs.apply(capsule,initArgs);}
if(args===INIT_ARGS)
args=initArgs;if(!isArray_(args)&&!isArguments_(args))
args=[args];return args;}
function getByNameAndType_(collection,name,typeFn){var i,p;for(i=0;i<collection.length;i++){p=collection[i];if((!typeFn||p[typeFn]())&&p._.name===name)
return p;}
return null;}
function getDefName_(def){return getPropertyOf_(def,def.substring(0,def.indexOf('.')));}
function getDefOwner_(def){var dotIndex=def.indexOf('.');if(dotIndex>-1)
return def.substring(0,dotIndex);else
throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure '+def+' has dot that separates element owner from its name.'));}
function getFQName_(on,sep){var own=on._.owner;return own?getFQName_(own,sep)+(isString_(sep)?sep:SEP)+on._.name:on._.name;}
function getOwner_(obj){return obj?obj._.owner:null;}
function getPropertyOf_(propStr,owner){owner=owner+'.';var i=propStr.indexOf(owner);if(i>-1)
if(propStr.length>i+owner.length)
return propStr.substring(i+owner.length);else
return'';else
return propStr;}
function getSelf_(self,ownerName){return ownerName==='this'?self:getByNameAndType_(self._.parts,ownerName);}
function getSelfHookOrLoop_(self,name){var result=getByNameAndType_(self._.hooks,name);if(isNothing_(result))
return getByNameAndType_(self._.loops,name);return result;}
function getSelfMethod_(self,name){var prop=self[name];return typeof prop==='function'?prop:null;}
function getSelfOperationOrMethod_(self,name){var result=getByNameAndType_(self._.pins,name);if(isNothing_(result))
return getSelfMethod_(self,name);return result;}
function onWhat_(capsule,what){var parts=capsule._.parts;for(var i=0;i<parts.length;i++){var part=parts[i];if(typeof part[what]==='function')
executeInContext_(part[what],part,part);onWhat_(part,what);}}
function contextWrapper_(fn,context){return function contextWrapper_(){return executeInContext_(fn,context,context,arguments);};}
function privateWrapper_(fn,superPrototype){return function(){checkContextCapsule_(this);this._.superPrototype=superPrototype;return fn.apply(this,arguments);};}
function publicWrapper_(fn,superPrototype){return function(){this._.superPrototype=superPrototype;return fn.apply(this,arguments);};}
function add_(var_args){var arr=arguments[0];if(!isArray_(arr))
arr=arguments;for(var i=0;i<arr.length;i++)
this.push(arr[i]);}
function addAt_(at,var_args){checkBounds_(at,this.length,'at');var skip=0,arr=arguments[1];if(!isArray_(arr)){skip=1;arr=arguments;}
for(var i=arr.length-1;i>=skip;i--)
this.splice(at,0,arr[i]);}
function clear_(){this.length=0;}
function get_(){return this.slice(0);}
function remove_(var_args){var arr=arguments[0];if(!isArray_(arr)){arr=arguments;}
for(var i=0;i<arr.length;i++){var index=this.indexOf(arr[i]);while(index!==-1){this.splice(index,1);index=this.indexOf(arr[i]);}}}
function extend(Sub,Base){Sub.prototype=Object.create(Base.prototype);Sub.prototype.constructor=Sub;Sub.super$=Base;}
var SEP='::',DYNAMIC='!',INIT_ARGS='this.args',NEW='*',New={OBJECT:'*{}',ARRAY:'*[]',MAP:'*Map',SET:'*Set',WEAKMAP:'*WeakMap',WEAKSET:'*WeakSet'},VisibilityType={PRIVATE:0,PUBLIC:1},ElementType={UNKNOWN:-1,OTHER:0,INPUT:1,OUTPUT:2,METHOD:3,HOOK:4,LOOP:5,FILTER:6};var Errors={OUT_OF_CONTEXT:new services.ErrorMessage(100,'Make sure you do this in the right context.'),ILLEGAL_ARGUMENT:new services.ErrorMessage(200,'Illegal argument(s). $1'),ELEMENT_NOT_FOUND:new services.ErrorMessage(201,'$1 could not be found among $2.'),INDEX_OUT_OF_BOUNDS:new services.ErrorMessage(202,'\'$1\' value of $2 exceeded the bounds: 0, $3.'),FORBIDDEN_NAME:new services.ErrorMessage(203,'Make sure $1 contains neither '+SEP+' nor dot.'),DUPLICATE_NAME:new services.ErrorMessage(204,'Duplicate name found: $1. Make sure operations, methods, hooks, loops, parts, and data all have unique names (inherited ones included).'),ILLEGAL_FILTERS_RETURN_VALUE:new services.ErrorMessage(205,'Make sure filter returns an array or the STOP message.'),ILLEGAL_METHODS_VISIBILITY:new services.ErrorMessage(207,'Changing inherited method\'s visibility is not allowed. Make sure the visibility of method $1 is $2.'),ABSTRACT_INSTANTIATION:new services.ErrorMessage(300,'Abstract capsules cannot be instantiated. Make sure you instantiate the right one.'),CAPSULE_ALREADY_ATTACHED:new services.ErrorMessage(301,'Capsule $1 has already been attached in a different context. Make sure you detach it there before attaching it again.'),ILLEGAL_OPERATION_TYPE:new services.ErrorMessage(400,'Operation \'$1\' cannot act as a $2 in this context. Make sure you pick the one that can.'),WIRE_INCOMPATIBILITY:new services.ErrorMessage(401,'The pair \'$1\' and \'$2\' is incompatible in the current context. Make sure you wire compatible operations.'),TIE_INCOMPATIBILITY:new services.ErrorMessage(500,'The pair \'$1\' and \'$2\' is incompatible in the current context. Make sure you tie compatible hooks/loops.'),ERROR:new services.ErrorMessage(666,'Something went wrong unexpectedly. Have you been monkeying with capsules\' internal structures / mechnisms? If not, please let us know about this (and don\'t forget the stack trace). Thank you. $1')};var main_=new(defCapsule({name:'Main'}))();main_._.name='main';var ctx_=main_,STOP={};var ElementRef=defCapsule({name:'ElementRef',hooks:'hook',loops:'loop',init:function(el){this.setElement_(el);},'+ getElement':function(){return this.getData('element');},setElement_:function(el){this.setData('element',el);this.hook._.el=el;this.loop._.el=el;}});var ServiceType={OPERATION:'OPERATION'};services.registerType(ServiceType.OPERATION,function(requests,config){var packed=[];for(var i=0;i<requests.length;i++)
packed.push(requests[i].body);if(config.async===true){config.operation._.send(packed).then(function(responses){if(!isArray_(responses)||responses.length!==requests.length)
services.rejectAll(requests,new Error(services.Errors.ILLEGAL_RESPONSE_SIZE.toString()));else
services.resolveAllSuccessful(requests,responses);},function(err){services.rejectAll(requests,err);});}else{var responses;try{responses=config.operation._.call(packed);if(!isArray_(responses)||responses.length!==requests.length)
throw new Error(services.Errors.ILLEGAL_RESPONSE_SIZE.toString());}catch(err){services.rejectAll(requests,err);return;}
services.resolveAllSuccessful(requests,responses);}});var ns={defCapsule:defCapsule,Input:Input,Output:Output,Hook:Hook,Loop:Loop,Capsule:Capsule,ElementRef:ElementRef,isCapsule:isCapsule,isOperation:isOperation,isHook:isHook,isLoop:isLoop,isCapsuleConstructor:isCapsuleConstructor,wire:wire,unwire:unwire,tie:tie,untie:untie,contextualize:contextualize,signOnForPostProcessing:signOnForPostProcessing,signOffForPostProcessing:signOffForPostProcessing,setDefaultElementHandlers:setDefaultElementHandlers,extend:extend,Errors:Errors,STOP:STOP,ServiceType:ServiceType};return ns;}));