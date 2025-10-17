public with sharing class WeatherSearchController {
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getWeatherByCity(String city) {
        if (String.isBlank(city)) {
            throw new AuraHandledException('City name cannot be empty.');
        }

        
        Weather_Config__mdt apiKeyRecord = Weather_Config__mdt.getInstance('OpenWeatherAPI');
        
        if (apiKeyRecord == null || String.isBlank(apiKeyRecord.API_Key__c)) {
            throw new AuraHandledException('API Key is not configured.');
        }
        String apiKey = apiKeyRecord.API_Key__c;
        String endpoint = '/data/2.5/weather?q=' + EncodingUtil.urlEncode(city, 'UTF-8') + '&appid=' + apiKey + '&units=imperial';

        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('callout:OpenWeather' + endpoint);
        request.setMethod('GET');
        HttpResponse response = http.send(request);

        if (response == null || response.getStatusCode() != 200) {
            throw new AuraHandledException('Error fetching weather data: ' + response.getBody());
        }

        return (Map<String, Object>) JSON.deserializeUntyped(response.getBody());

    }
}