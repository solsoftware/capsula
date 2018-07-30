describe('SOAP_SERVICE service type', function () {
			const PORT = 4000,
			SERVER = 'http://127.0.0.1:';
			
            var services = require('../../src/services.js');
            beforeAll(function () {

                services.register('mySOAPService', {
                    type: services.ServiceType.SOAP_SERVICE,
                    operationName: 'echo',
                    wsdlURL: SERVER + PORT + '/SoapTest?wsdl'
                });
            });

            it('should verify service type is working', function (done) {

                services.send('mySOAPService', {
                    message: 'Hello, world'
                }).then(function (response) {
                    expect(response.message).toEqual('Hello, world Hello main!');
                    done();
                }).catch(function (err) {
                    fail('because onError is called');
                    done();
                });

                services.flush('mySOAPService');
            });

            afterAll(function () {
                services.unregister('mySOAPService');
            });
        });