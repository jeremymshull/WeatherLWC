# Weather LWC Project

A Salesforce DX project demonstrating a Lightning Web Component (LWC) that fetches and displays weather information via an Apex controller. The project includes unit tests for Apex and Jest tests for the LWC, along with mocks for callouts to ensure deterministic testing.

- LWC: `weatherCard`
- Apex: `WeatherSearchController` (+ mocks)
- Tests: `WeatherSearchControllerTest` (Apex) and `weatherCard.test.js` (Jest)

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Local Setup](#local-setup)
- [Org Setup and Deployment](#org-setup-and-deployment)
- [Running and Testing](#running-and-testing)
- [Configuration and Environment](#configuration-and-environment)
- [Security and Permissions](#security-and-permissions)
- [Project Structure](#project-structure)
- [Extensibility Guide](#extensibility-guide)
- [Whats New](#whats-new)
- [Future Enhancements](#future-enhancements)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Overview
This app provides a simple UI to search and view weather details. The `weatherCard` LWC calls the `WeatherSearchController` Apex class which performs an HTTP callout to a weather API (mocked for tests). The codebase follows Salesforce best practices: bulkification patterns, separation of concerns, mocks for callouts, and unit tests.

Key behavior:
- Record-aware: When placed on Account or Contact record pages, the component auto-detects the record’s city (Account.BillingCity or Contact.MailingCity).
- Auto-fetch: If a city is detected from the record, the component automatically fetches and displays weather on load.
- Manual override: Users can enter a different city at any time; press Enter or click Get Weather. A Clear button resets the view and allows auto-fetch again if applicable.
- Polished SLDS UI: Header summary, metrics grid, spinner for loading, SLDS alert for errors, and original action:* icon set for a cohesive look.

## Architecture

- LWC: `weatherCard`
  - Record-aware via `@api recordId` and `@api objectApiName`.
  - Auto-detects city:
    - Account → BillingCity
    - Contact → MailingCity
  - Auto-fetches on load when a detected city exists; users can override the input manually.
  - UI/UX:
    - SLDS-based layout with a summary header (city, description badge, temperature + feels like)
    - Two-column responsive metrics grid (temperature, conditions, humidity, wind)
    - Loading `lightning-spinner` and SLDS error alert
    - Enter-to-search and Clear button
  - Includes Jest tests under `force-app/main/default/lwc/weatherCard/__tests__/`.

- Apex: `WeatherSearchController`
  - with sharing.
  - Exposes `@AuraEnabled(cacheable=true) getWeatherByCity(String city)` to fetch weather data.
  - Encapsulates HTTP callout logic and response parsing using a Named Credential (`callout:OpenWeather`) and Custom Metadata (`Weather_Config__mdt`).
  - Unit-tested by `WeatherSearchControllerTest.cls`.

- Apex Mocks:
  - `WeatherServiceMock.cls`: Implements `HttpCalloutMock` to return a synthetic response for tests.
  - `WeatherErrorMock.cls`: Returns an error response to test negative paths.

- Testing:
  - Apex tests validate controller logic and callout handling.
  - Jest tests validate LWC UI behavior and interactions.

## Local Setup

Prerequisites:
- Node.js LTS
- Salesforce CLI (`sf`), not `sfdx`
- VS Code with Salesforce Extensions

Clone:
- git clone https://github.com/jeremymshull/WeatherLWC.git
- cd WeatherLWC

Install Node deps:
- npm install

Optional: Prettier/ESLint config is included.

## Org Setup and Deployment

Authorize an org:
- sf org login web -s -a WeatherLWC

Create a scratch org (optional):
- sf org create scratch -f config/project-scratch-def.json -a WeatherLWCScratch -s -d 7

Push/deploy source:
- For Scratch Org: sf project deploy start -d force-app -o WeatherLWCScratch
- For Default Org: sf project deploy start -d force-app

Assign permissions (if applicable):
- If this repo introduces permission sets under force-app/main/default/permissionsets, assign as needed:
  - sf org assign permset -n YourPermissionSetName

Open the org:
- sf org open

## Running and Testing

- Apex Tests:
  - Run all: sf apex run test -o <alias or username> --code-coverage --result-format human
  - Run a class: sf apex run test --tests WeatherSearchControllerTest -o <alias>

- LWC Unit Tests (Jest):
  - npm run test:unit
  - npm run test:unit:watch

- Lint:
  - npm run lint

- Format:
  - npm run prettier

## Configuration and Environment

- Weather API Endpoint and Key:
  - Named Credential: `OpenWeather` should be configured to point to the OpenWeather API base URL.
  - Custom Metadata: A `Weather_Config__mdt` record named `OpenWeatherAPI` must contain a valid `API_Key__c`.
  - The controller reads the API key from Custom Metadata and calls the Named Credential endpoint.

- Test Mocks:
  - `WeatherServiceMock` and `WeatherErrorMock` ensure no external callouts during tests.
  - Use `Test.setMock(HttpCalloutMock.class, new WeatherServiceMock());` in tests.

## Security and Permissions

- Apex classes should run with sharing.
- Do not hardcode secrets; use Named Credentials or Protected Custom Metadata.
- Ensure FLS and CRUD are respected when accessing sObjects. Use WITH SECURITY_ENFORCED in SOQL where applicable.
- If a permission set is provided for this feature, assign it only to users who need access.

## Project Structure

- README.md
- sfdx-project.json
- force-app/main/default/
  - classes/
    - WeatherSearchController.cls (+ meta.xml)
    - WeatherSearchControllerTest.cls (+ meta.xml)
    - WeatherServiceMock.cls (+ meta.xml)
    - WeatherErrorMock.cls (+ meta.xml)
  - lwc/
    - weatherCard/
      - weatherCard.html
      - weatherCard.js
      - weatherCard.js-meta.xml
      - __tests__/weatherCard.test.js
  - permissionsets/ (if present)
  - other metadata folders (tabs, layouts, etc.)

- scripts/
  - apex/hello.apex
  - soql/account.soql

- Tooling configs:
  - eslint.config.js, jest.config.js, .prettierrc

## Extensibility Guide

- Add new fields to the weather UI:
  - Extend the Apex response mapping in `WeatherSearchController`.
  - Update `weatherCard.js` to include new properties and render them in `weatherCard.html`.
  - Add Jest tests to validate rendering and behavior.

- Swap Weather Provider:
  - Introduce an interface pattern in Apex and create provider-specific implementations.
  - Configure via Custom Metadata or Named Credentials to choose provider at runtime.

- Flow Integration:
  - Consider an Invocable Apex method to allow Flows to request weather data.
  - Ensure input validation and robust error handling.

- Caching:
  - For repeated queries, implement Platform Cache or cacheable AuraEnabled methods when appropriate.

## Whats New

Recent enhancements to `weatherCard`:
- Record-aware defaulting: Reads Account.BillingCity / Contact.MailingCity when placed on record pages.
- Auto-fetch on load: Automatically retrieves weather when a record city exists.
- Manual override: Input supports Enter-to-search, and a Get Weather button is still available.
- Clear action: Resets results and allows auto-fetch again when applicable.
- Polished SLDS UI: Summary header, description badge, responsive metrics grid, spinner, and SLDS error alert.
- Iconography: Restored original action:* icons for City/Temperature/Description/Humidity/Wind for cohesive visual design.

## Future Enhancements

Planned ideas (not yet implemented):
- Disambiguation & accuracy:
  - Include StateCode/CountryCode in queries or geocode first, then fetch by lat/lon.
- Forecast:
  - Optional 5-day forecast section/tab (/forecast endpoint).
- Units toggle:
  - °F/°C toggle with persisted user preference.
- Condition glyphs:
  - Map API condition icon to a dynamic image or SLDS-friendly indicator.
- Compact/dense mode:
  - Public property to reduce spacing for tight page regions.
- Caching:
  - Platform Cache for popular queries, TTL-based.
- Admin configurables:
  - Auto-fetch on/off, default units, show/hide metrics, disambiguation toggle.
- Record integration:
  - Weather_Snapshot__c to log snapshots linked to Account/Contact.
- Auto-refresh:
  - Re-fetch on record city changes via Lightning Message Service.
- I18n & Accessibility:
  - Custom Labels for text, locale-aware formatting, enhanced aria-live usage.
- Testing:
  - Broader Jest coverage (auto-fetch/manual override/error/loading) and Apex tests for future geocoding/caching.

## Troubleshooting

- Callout failures:
  - Verify Named Credential/endpoint and API key configuration.
  - Check Remote Site Settings if not using Named Credentials.

- Tests failing:
  - Ensure mocks are set with `Test.setMock` for Apex.
  - For Jest, check module mocks and verify DOM updates with async expectations.

- Deployment issues:
  - Confirm default org/alias is set.
  - Use `sf project deploy start --verbose` for more details.

## License
MIT
