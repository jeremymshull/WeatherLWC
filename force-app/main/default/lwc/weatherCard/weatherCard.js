import { api, LightningElement, track, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import getWeatherByCity from '@salesforce/apex/WeatherSearchController.getWeatherByCity';
import ACCOUNT_BILLING_CITY from '@salesforce/schema/Account.BillingCity';
import CONTACT_MAILING_CITY from '@salesforce/schema/Contact.MailingCity';

export default class WeatherCard extends LightningElement {
  @api recordId;
  @api objectApiName;

  @track city = '';
  @track weather;
  @track error;
  @track description;
  @track isLoading = false;
  // guard to prevent multiple automatic fetches from reactive re-wires
  hasAutoFetched = false;

  get hasResults() {
    return !!this.weather;
  }

  // flag to know if user manually typed and overrode auto-detected city
  userOverrode = false;

  static ACCOUNT_FIELDS = [ACCOUNT_BILLING_CITY];
  static CONTACT_FIELDS = [CONTACT_MAILING_CITY];

  // compute fields to request based on object type
  get fieldsToQuery() {
    if (!this.objectApiName) return [];
    if (this.objectApiName === 'Account') return WeatherCard.ACCOUNT_FIELDS;
    if (this.objectApiName === 'Contact') return WeatherCard.CONTACT_FIELDS;
    return [];
  }

  // Wire record data when we have a recordId and supported object
  @wire(getRecord, { recordId: '$recordId', fields: '$fieldsToQuery' })
  wiredRecord({ data, error }) {
    if (error) {
      // keep prior errors from Apex separate; this is record fetch error
      // show a gentle hint only if user hasn't interacted
      if (!this.userOverrode) {
        this.error = 'Unable to read city from this record. You can still enter a city manually.';
      }
      return;
    }
    if (data) {
      const detectedCity =
        this.objectApiName === 'Account'
          ? getFieldValue(data, ACCOUNT_BILLING_CITY)
          : this.objectApiName === 'Contact'
          ? getFieldValue(data, CONTACT_MAILING_CITY)
          : null;

      // If user hasn't typed yet and we have a detected city, set it
      if (!this.userOverrode && detectedCity) {
        // If the detected city changes, allow re-auto-fetch once for a new city value
        const cityChanged = this.city !== detectedCity;
        this.city = detectedCity;
        // Clear any prior "no city" hint
        if (this.error && this.error.includes('No city on this record')) {
          this.error = null;
        }
        // Auto-fetch once when we have a detected city and haven't fetched yet for it
        if ((cityChanged || !this.hasAutoFetched) && !this.hasAutoFetched) {
          // Use microtask to ensure city assignment completes before fetchWeather reads it
          Promise.resolve().then(async () => {
            await this.fetchWeather();
            this.hasAutoFetched = true;
          });
        }
      } else if (!this.userOverrode && !detectedCity) {
        // Provide a helpful hint if no city available
        this.error = 'No city on this record. Enter a city manually.';
      }
    }
  }

  handleCityChange(event) {
    this.city = event.target.value;
    this.userOverrode = true;
    // Once user overrides, allow manual fetches to control results
    this.hasAutoFetched = false;
    // Clear UI errors when user starts typing
    if (this.error) {
      this.error = null;
    }
  }

  handleKeyUp(event) {
    if (event.key === 'Enter') {
      this.fetchWeather();
    }
  }

  handleClear() {
    this.weather = null;
    this.error = null;
    this.description = null;
    this.userOverrode = false;
    // If we are on a record with detected city, allow auto-fetch to run again
    this.hasAutoFetched = false;
    // If a record city was previously set, keep it; otherwise clear input
    if (!this.recordId || !this.objectApiName) {
      this.city = '';
    }
  }

  async fetchWeather() {
    this.error = null;
    this.weather = null;

    if (!this.city) {
      this.error = 'Please enter a city name.';
      return;
    }

    try {
      this.isLoading = true;
      const data = await getWeatherByCity({ city: this.city });
      this.weather = data;

      if (data?.weather?.length) {
        this.description = data.weather[0].description;
      } else {
        this.description = 'No description available';
      }
    } catch (err) {
      this.error = err && (err.body?.message || err.message) ? (err.body?.message || err.message) : 'An unexpected error occurred.';
    } finally {
      this.isLoading = false;
    }
  }

  get sourcedFromRecordNote() {
    if (this.userOverrode) return null;
    if (!this.recordId || !this.objectApiName) return null;
    if (this.objectApiName === 'Account' && this.city) return 'Using Account Billing City';
    if (this.objectApiName === 'Contact' && this.city) return 'Using Contact Mailing City';
    return null;
  }
}
