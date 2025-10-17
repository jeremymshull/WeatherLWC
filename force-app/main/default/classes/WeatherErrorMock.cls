@IsTest
global class WeatherErrorMock implements HttpCalloutMock {
    global HTTPResponse respond(HTTPRequest req) {
        HttpResponse res = new HttpResponse();
        res.setStatusCode(404);
        res.setStatus('Bad Request');
        res.setHeader('Content-Type', 'application/json');
        res.setBody('{"message":"city not found"}');
        return res;
    }
}
