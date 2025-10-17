@IsTest
global with sharing class WeatherServiceMock implements HttpCalloutMock {
    global HttpResponse respond(HttpRequest req) {
        // Create a fake JSON response similar to the real API
        String body = '{"name":"Indianapolis","weather":[{"description":"clear sky"}],"main":{"temp":23,"humidity":45},"wind":{"speed":5.5}}';

        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setBody(body);
        res.setStatusCode(200);
        return res;
    }
}