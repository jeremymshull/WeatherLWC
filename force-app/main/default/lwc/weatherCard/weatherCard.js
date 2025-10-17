import { LightningElement, track } from 'lwc';
import getWeatherByCity from '@salesforce/apex/WeatherSearchController.getWeatherByCity';

export default class WeatherCard extends LightningElement {
  @track city = '';
  @track weather;
  @track error;
  @track description;

  handleCityChange(event) {
    this.city = event.target.value;
  }

  async fetchWeather() {
    this.error = null;
    this.weather = null;

    if (!this.city) {
      this.error = 'Please enter a city name.';
      return;
    }

    try {
      const data = await getWeatherByCity({ city: this.city });
      this.weather = data;

      if (data?.weather?.length) {
        this.description = data.weather[0].description;
      } else {
        this.description = 'No description available';
      }

    } catch (err) {
      this.error = err.body?.message || err.message;
    }
  }
}