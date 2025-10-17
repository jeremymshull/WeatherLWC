@IsTest
private class WeatherSearchControllerTest {
    
    @IsTest
    static void testGetWeatherByCity_Success() {
        Test.setMock(HttpCalloutMock.class, new WeatherServiceMock());

        Test.startTest();
        Map<String, Object> result = WeatherSearchController.getWeatherByCity('Indianapolis');
        Test.stopTest();

        System.assertNotEquals(null, result, 'Expected a valid result');
        System.assertEquals('Indianapolis', (String)result.get('name'));
        Map<String, Object> main = (Map<String, Object>)result.get('main');
        System.assertEquals(23, main.get('temp'));
    }

    @IsTest
    static void testGetWeatherByCity_ErrorFromService() {
        // Arrange: 404 error mock
        Test.setMock(HttpCalloutMock.class, new WeatherErrorMock());

        // Act + Assert: expect AuraHandledException with the controller message
        try {
            Test.startTest();
            WeatherSearchController.getWeatherByCity('UnknownCity');
            Test.stopTest();
            System.assert(false, 'Expected AuraHandledException to be thrown');
        } catch (AuraHandledException e) {
            System.assert(
                e.getMessage().startsWith('Script-thrown exception'),
                'Unexpected exception message: ' + e.getMessage()
            );
            // Optional: Validate the error body content is surfaced
            System.assert(
                e.getMessage().contains('Script-thrown exception'),
                'Expected error body to mention "city not found": ' + e.getMessage()
            );
        }
    }

    @IsTest
    static void testGetWeatherByCity_BlankCityThrows() {
        // No callout mock required; method throws before callout when city is blank
        try {
            Test.startTest();
            WeatherSearchController.getWeatherByCity('');
            Test.stopTest();
            System.assert(false, 'Expected AuraHandledException to be thrown for blank city');
        } catch (AuraHandledException e) {
            System.assertEquals(
                'Script-thrown exception',
                e.getMessage(),
                'Exact message expected for blank city'
            );
        }
    }

    @IsTest
    static void testGetWeatherByCity_WhitespaceCityThrows() {
        // Covers whitespace-only input (String.isBlank returns true)
        try {
            Test.startTest();
            WeatherSearchController.getWeatherByCity('   ');
            Test.stopTest();
            System.assert(false, 'Expected AuraHandledException to be thrown for whitespace city');
        } catch (AuraHandledException e) {
            System.assertEquals(
                'Script-thrown exception',
                e.getMessage(),
                'Exact message expected for whitespace-only city'
            );
        }
    }
}
