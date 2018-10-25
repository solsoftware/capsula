/*
Copyright 2018 SOL Software

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

describe('Services', function () {
    const PORT = 3000,
    SERVER = 'http://127.0.0.1:',
    html = window.html,
    capsula = window.capsula;

    function errorToRegExp(error) {
        return new RegExp(error.desc.replace(/\$\d/g, ".+").replace('(', '\\(').replace(')', '\\)'));
    }

    describe('register(serviceName, serviceConfig)', function () {
        it('should throw error when serviceName is not a string', function () {
            expect(function () {
                services.register();
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.register(null);
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.register({});
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.register(2);
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.register([]);
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));
        });

        it('should throw error when serviceConfig.type is not a string', function () {
            expect(function () {
                services.register('fail');
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.register('fail', null);
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.register('fail', {});
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.register('fail', 2);
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.register('fail', []);
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.register('fail', {
                    type: null
                });
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.register('fail', {
                    type: {}
                });
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.register('fail', {
                    type: 2
                });
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.register('fail', {
                    type: []
                });
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));
        });

        it('should throw error when service type does not exist', function () {
            expect(function () {
                services.register('fail', {
                    type: 'missing type'
                });
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));
        });

        it('should verify service is registered', function () {
            expect(function () {
                services.register('new_service', {
                    type: html.ServiceType.AJAX
                });
            }).not.toThrowError();
        });

        it('should throw error when service with the given name alredy exists', function () {
            expect(function () {
				services.register('duplicate_service', {
                    type: html.ServiceType.AJAX
                });
                services.register('duplicate_service', {
                    type: html.ServiceType.AJAX
                });
            }).toThrowError(errorToRegExp(services.Errors.SERVICE_ALREADY_REGISTERED));
        });

        it('should verify service is overwritten', function () {
            expect(function () {
				services.register('overwritten_service', {
                    type: html.ServiceType.AJAX
                }, true);
                services.register('overwritten_service', {
                    type: html.ServiceType.AJAX
                }, true);
            }).not.toThrowError();
        });

        afterAll(function () {
            services.unregister('overwritten_service');
            services.unregister('duplicate_service');
            services.unregister('new_service');
        });
    });

    describe('isRegistered(serviceName)', function () {
        it('should throw error when serviceName is not a string', function () {
            expect(function () {
                services.isRegistered();
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.isRegistered(null);
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.isRegistered({});
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.isRegistered(2);
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.isRegistered([]);
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));
        });

        it('should return false for the missing service', function () {
            expect(services.isRegistered('missing')).toBe(false);
        });

        it('should return true for the existing service', function () {
            services.register('newService', {
                type: html.ServiceType.AJAX
            });
            expect(services.isRegistered('newService')).toBe(true);
        });

        afterAll(function () {
            services.unregister('newService');
        });
    });

    describe('unregister(serviceName)', function () {
        beforeAll(function () {
            services.register('newService', {
                type: html.ServiceType.AJAX
            });
        });

        it('should throw error when serviceName is not a string', function () {
            expect(function () {
                services.unregister();
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.unregister(null);
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.unregister({});
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.unregister(2);
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.unregister([]);
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));
        });

        it('should throw error when service with specified serviceName does not exist', function () {
            expect(function () {
                services.unregister('missing');
            }).toThrowError(errorToRegExp(services.Errors.SERVICE_UNREGISTERED));
        });

        it('should verify service is unregistered', function () {
            expect(services.isRegistered('newService')).toBe(true);

            expect(function () {
                services.unregister('newService');
            }).not.toThrowError();

            expect(services.isRegistered('newService')).toBe(false);
        });
    });

    describe('registerType(serviceType, serviceFunction)', function () {
        it('should throw error when serviceType is not a string', function () {
            expect(function () {
                services.registerType();
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.registerType(null);
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.registerType({});
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.registerType(2);
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.registerType([]);
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));
        });

        it('should throw error when serviceFunction is not a function', function () {
            expect(function () {
                services.registerType('newType');
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.registerType('newType', null);
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.registerType('newType', 2);
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.registerType('newType', []);
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));
        });

        it('should verify service type registration works', function () {
            expect(function () {
                services.registerType('newType', function serviceFunction(requests, config) {});
            }).not.toThrowError();
        });
    });

    describe('send(serviceName, request)', function () {
        it('should throw error when serviceName is not a string', function () {
            expect(function () {
                services.send();
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.send(null);
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.send({});
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.send(2);
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                services.send([]);
            }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));
        });

        it('should throw error when sending to non-existing service', function () {
            expect(function () {
                services.send('missing', {});
            }).toThrowError(errorToRegExp(services.Errors.SERVICE_UNREGISTERED));
        });

        it('should verify sending works as expected', function () {
            services.registerType('newServiceType', function serviceFunction(requests, config) {});
            services.register('newService', {
                type: 'newServiceType'
            });

            expect(function () {
                services.send('newService', null);
            }).not.toThrowError();

            expect(function () {
                services.send('newService', 1);
            }).not.toThrowError();

            expect(function () {
                services.send('newService', 'anything');
            }).not.toThrowError();

            expect(function () {
                services.send('newService', true);
            }).not.toThrowError();

            expect(function () {
                services.send('newService', []);
            }).not.toThrowError();

            var promise = services.send('newService', {});
            expect(
                typeof promise.then === 'function' &&
                typeof promise['catch'] === 'function').toBe(true);

            services.unregister('newService');
        });
    });

    describe('flushing', function () {
        beforeAll(function () {
            services.registerType('myServiceType', function (requests, config) {
                var packedRequests = [];
                for (var i = 0; i < requests.length; i++)
                    packedRequests.push(config.pre + requests[i].body + config.post);

                if (config.success) {
                    var response = [];
                    for (var i = 0; i < packedRequests.length; i++)
                        response.push(config.pre + packedRequests[i] + config.post);

                    var unpacked = [];
                    for (var i = 0; i < response.length; i++)
                        unpacked.push(config.pre + response[i] + config.post);

                    services.resolveAll(requests, unpacked);
                } else
                    services.rejectAll(requests, new Error());
            });

            services.registerType('myThrowErrorServiceType', function (requests, config) {
                throw new Error();
            });

            services.register('mySuccessService', {
                type: 'myServiceType',
                success: true,
                pre: '<',
                post: '>'
            });

            services.register('myErrorService', {
                type: 'myServiceType',
                success: false,
                pre: '<',
                post: '>'
            });

            services.register('myThrowErrorService', {
                type: 'myThrowErrorServiceType'
            });
        });

        describe('flush(serviceName)', function () {
            it('should throw error when serviceName is not a string', function () {
                expect(function () {
                    services.flush();
                }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    services.flush(null);
                }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    services.flush({});
                }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    services.flush(2);
                }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    services.flush([]);
                }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify successful scenario works', function (done) {
                services.send('mySuccessService', '1')
                .then(function (response) {
                    expect(response).toBe('<<<1>>>');
                    done();
                }, function (error) {
                    fail('because onError should not get called in successful scenario');
                    done();
                });
                services.flush('mySuccessService');
            });

            it('should verify erroneous scenario works', function (done) {
                services.send('myErrorService', '1')
                .then(function (response) {
                    fail('because onSuccess should not get called in erroneous scenario');
                    done();
                }, function (error) {
                    expect(error).toBeDefined();
                    done();
                });
                services.flush('myErrorService');
            });

            it('should throw error when serviceFunction throws error', function () {
                services.send('myThrowErrorService', null);
                expect(function () {
                    services.flush('myThrowErrorService');
                }).toThrowError();
            });
        });

        describe('flushAll()', function () {
            it('should verify flushAll works for success scenario', function (done) {
                services.send('mySuccessService', '1')
                .then(function (response) {
                    expect(response).toBe('<<<1>>>');
                    done();
                }, function (error) {
                    fail('because onError should not get called in successful scenario');
                    done();
                });
                services.flushAll();
            });

            it('should verify flushAll works for erroneous scenario', function (done) {
                services.send('myErrorService', '1')
                .then(function (response) {
                    fail('because onSuccess should not get called in erroneous scenario');
                    done();
                }, function (error) {
                    expect(error).toBeDefined();
                    done();
                });
                services.flushAll();
            });
        });

        afterAll(function () {
            services.unregister('mySuccessService');
            services.unregister('myErrorService');
            services.unregister('myThrowErrorService');
        });
    });

    describe('checking the built-in service types', function () {

        describe('AJAX service type', function () {
            beforeAll(function () {
                services.register('ajax', {
                    type: html.ServiceType.AJAX,
                    url: SERVER + PORT + '/ajax-service',
                    method: 'post'
                });
            });

            it('should verify service type is working', function (done) {
                services.send('ajax', {
                    message: 'Hello AJAX'
                }).then(function (response) {
                    expect(response.message).toBe('Hello AJAX');
                    done();
                }, function (error) {
                    fail('because onError is called');
                    done();
                });
                services.flush('ajax');
            });

            afterAll(function () {
                services.unregister('ajax');
            });
        });

        describe('AJAX_URL_ENCODED service type', function () {
            beforeAll(function () {
                services.register('ajaxUrlEncoded', {
                    type: html.ServiceType.AJAX_URL_ENCODED,
                    url: SERVER + PORT + '/ajax-url-encoded-service',
                    method: 'get'
                });
            });

            it('should verify service type is working', function (done) {
                services.send('ajaxUrlEncoded', {
                    message: 'Hello AJAX_URL_ENCODED'
                }).then(function (response) {
                    expect(response.message).toBe('Hello AJAX_URL_ENCODED');
                    done();
                }, function (error) {
                    fail('because onError is called');
                    done();
                });
                services.flush('ajaxUrlEncoded');
            });

            afterAll(function () {
                services.unregister('ajaxUrlEncoded');
            });
        });

        describe('AJAX_JQUERY service type', function () {
            beforeAll(function () {
                services.register('ajaxJQuery', {
                    type: html.ServiceType.AJAX_JQUERY,
                    url: SERVER + PORT + '/ajax-jquery-service',
                    method: 'post'
                });
            });

            it('should verify service type is working', function (done) {
                services.send('ajaxJQuery', {
                    message: 'Hello AJAX_JQUERY'
                }).then(function (response) {
                    expect(response.message).toBe('Hello AJAX_JQUERY');
                    done();
                }, function (error, request, textStatus, physicalRequest) {
                    fail('because onError is called');
                    done();
                });
                services.flush('ajaxJQuery');
            });

            afterAll(function () {
                services.unregister('ajaxJQuery');
            });
        });

        describe('OPERATION service type', function () {
            beforeAll(function () {
                var Inner = capsula.defCapsule({
                        '> good': function (requests) {
                            var response = [];
                            for (var i = 0; i < requests.length; i++) {
                                requests[i].served = true;
                                requests[i].success = true;
                                response.push(requests[i]);
                            }
                            return response;
                        },
                        '> bad0': function (requests) {
                            return undefined;
                        },
                        '> bad1': function (requests) {
                            return {};
                        },
                        '> bad2': function (requests) {
                            return requests.concat({});
                        }
                    }),
                Outer = capsula.defCapsule({
                        p: Inner
                    }),
                o = new Outer();

                services.register('good', {
                    type: capsula.ServiceType.OPERATION,
                    operation: o.p.good
                });
                services.register('bad0', {
                    type: capsula.ServiceType.OPERATION,
                    operation: o.p.bad0
                });
                services.register('bad1', {
                    type: capsula.ServiceType.OPERATION,
                    operation: o.p.bad1
                });
                services.register('bad2', {
                    type: capsula.ServiceType.OPERATION,
                    operation: o.p.bad2
                });

                services.register('good-async', {
                    type: capsula.ServiceType.OPERATION,
                    operation: o.p.good,
                    async: true
                });
                services.register('bad0-async', {
                    type: capsula.ServiceType.OPERATION,
                    operation: o.p.bad0,
                    async: true
                });
                services.register('bad1-async', {
                    type: capsula.ServiceType.OPERATION,
                    operation: o.p.bad1,
                    async: true
                });
                services.register('bad2-async', {
                    type: capsula.ServiceType.OPERATION,
                    operation: o.p.bad2,
                    async: true
                });
            });

            it('should verify service type is working for good operation', function (done) {
                services.send('good', {
                    message: 'Hello OPERATION'
                }).then(function (response) {
                    expect(response.served).toBe(true);
                    expect(response.message).toBe('Hello OPERATION');
                    done();
                }, function (error) {
                    fail('because onError is called');
                    done();
                });
                services.flush('good');
            });

            it('should throw error for operation that returns nothing', function (done) {
                services.send('bad0', {
                    message: 'Hello OPERATION'
                }).then(function (response) {
                    fail('because operation is bad');
                    done();
                }, function (error) {
                    expect(function () {
                        throw error;
                    }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_RESPONSE_SIZE));
                    done();
                });
                services.flush('bad0');
            });

            it('should throw error for operation that returns object (not array)', function (done) {
                services.send('bad1', {
                    message: 'Hello OPERATION'
                }).then(function (response) {
                    fail('because operation is bad');
                    done();
                }, function (error) {
                    expect(function () {
                        throw error;
                    }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_RESPONSE_SIZE));
                    done();
                });
                services.flush('bad1');
            });

            it('should throw error for operation that returns wrong-sized array', function (done) {
                services.send('bad2', {
                    message: 'Hello OPERATION'
                }).then(function (response) {
                    fail('because operation is bad');
                    done();
                }, function (error) {
                    expect(function () {
                        throw error;
                    }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_RESPONSE_SIZE));
                    done();
                });
                services.flush('bad2');
            });

            it('should verify service type is working for good operation (async mode)', function (done) {
                services.send('good-async', {
                    message: 'Hello OPERATION'
                }).then(function (response) {
                    expect(response.served).toBe(true);
                    expect(response.message).toBe('Hello OPERATION');
                    done();
                }, function (error) {
                    fail('because onError is called');
                    done();
                });
                services.flush('good-async');
            });

            it('should throw error for operation that returns nothing (async mode)', function (done) {
                services.send('bad0-async', {
                    message: 'Hello OPERATION'
                }).then(function (response) {
                    fail('because operation is bad');
                    done();
                }, function (error) {
                    expect(function () {
                        throw error;
                    }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_RESPONSE_SIZE));
                    done();
                });
                services.flush('bad0-async');
            });

            it('should throw error for operation that returns object (not array) (async mode)', function (done) {
                services.send('bad1-async', {
                    message: 'Hello OPERATION'
                }).then(function (response) {
                    fail('because operation is bad');
                    done();
                }, function (error) {
                    expect(function () {
                        throw error;
                    }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_RESPONSE_SIZE));
                    done();
                });
                services.flush('bad1-async');
            });

            it('should throw error for operation that returns wrong-sized array (async mode)', function (done) {
                services.send('bad2-async', {
                    message: 'Hello OPERATION'
                }).then(function (response) {
                    fail('because operation is bad');
                    done();
                }, function (error) {
                    expect(function () {
                        throw error;
                    }).toThrowError(errorToRegExp(services.Errors.ILLEGAL_RESPONSE_SIZE));
                    done();
                });
                services.flush('bad2-async');
            });

            afterAll(function () {
                services.unregister('good');
                services.unregister('bad0');
                services.unregister('bad1');
                services.unregister('bad2');
                services.unregister('good-async');
                services.unregister('bad0-async');
                services.unregister('bad1-async');
                services.unregister('bad2-async');
            });
        });

        describe('FUNCTION service type', function () {
            beforeAll(function () {
                var targetFunction = function (requestsArr) {
                    var response = [],
                    result = {
                        message: requestsArr[0].message + ' Hello main!',
                        success: true
                    };
                    response.push(result);
                    return response;
                };

                services.register('myFunction', {
                    type: services.ServiceType.FUNCTION,
                    func: targetFunction
                });
            });

            it('should verify service type is working', function (done) {
                services.send('myFunction', {
                    message: 'Hello function!'
                }).then(function (response) {
                    expect(response.message).toEqual('Hello function! Hello main!');
                    done();
                }, function (error) {
                    fail('because onError is called');
                    done();
                });
                services.flush('myFunction');
            });

            afterAll(function () {
                services.unregister('myFunction');
            });
        });

        describe('ASYNC_FUNCTION service type', function () {
            beforeAll(function () {
                var targetFunction = function (requestsArr) {
                    var promise = new Promise(function(resolve, reject) {
                        result = {
                            message: requestsArr[0].message + ' Hello main!',
                            success: true
                        };
                        var response = [];
                        response.push(result);
                        resolve(response);
                    });
                    return promise;
                }
                
                services.register('myFunction', {
                    type: services.ServiceType.ASYNC_FUNCTION,
                    func: targetFunction
                });
            });
        
            it('should verify service type is working', function (done) {
                
                services.send('myFunction', {message: 'Hello function!'}).then(function(response) {
                    expect(response.message).toEqual('Hello function! Hello main!');
                    done();
                }, function (error) {
                    fail('because onError is called');
                    done();
                });
                services.flush('myFunction');
            });
        
            afterAll(function () {
                services.unregister('myFunction');
            });
        });
    });
});
