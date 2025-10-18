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
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Overview
This app provides a simple UI to search and view weather details. The `weatherCard` LWC calls the `WeatherSearchController` Apex class which performs an HTTP callout to a weather API (mocked for tests). The codebase follows Salesforce best practices: bulkification patterns, separation of concerns, mocks for callouts, and unit tests.

## Architecture

- LWC: `weatherCard`
  - Renders a search input and weather display area.
  - Invokes Apex (imperative or @wire) to retrieve weather for a location.
  - Includes Jest tests under `force-app/main/default/lwc/weatherCard/__tests__/`.

- Apex: `WeatherSearchController`
  - with sharing.
  - Exposes an Apex method (likely `@AuraEnabled(cacheable=true)` or non-cache) to fetch weather data.
  - Encapsulates HTTP callout logic and response parsing.
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
  - If the controller expects Named Credentials or Custom Metadata/Settings, configure them in the org and align with the controller’s implementation.
  - Common options:
    - Named Credential (recommended): Create a Named Credential for the weather API and reference it in Apex.
    - Custom Metadata/Settings: Store base URL and API key. Reference via SOQL with WITH SECURITY_ENFORCED where appropriate.
  - Update the Apex controller to read values from your chosen config source and ensure FLS/sharing checks as needed.

- Test Mocks:
  - `WeatherServiceMock` and `WeatherErrorMock` ensure no external callouts during tests.
  - Use Test.setMock(HttpCalloutMock.class, new WeatherServiceMock()); in tests.

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
  - Extend the Apex response mapping in WeatherSearchController.
  - Update weatherCard.js to include new properties and render them in weatherCard.html.
  - Add Jest tests to validate rendering and behavior.

- Swap Weather Provider:
  - Introduce an interface pattern in Apex and create provider-specific implementations.
  - Configure via Custom Metadata or Named Credentials to choose provider at runtime.

- Flow Integration:
  - Consider an Invocable Apex method to allow Flows to request weather data.
  - Ensure input validation and robust error handling.

- Caching:
  - For repeated queries, implement Platform Cache or cacheable AuraEnabled methods when appropriate.

## Troubleshooting

- Callout failures:
  - Verify Named Credential/endpoint and API key configuration.
  - Check Remote Site Settings if not using Named Credentials.

- Tests failing:
  - Ensure mocks are set with Test.setMock for Apex.
  - For Jest, check module mocks and verify DOM updates with async expectations.

- Deployment issues:
  - Confirm default org/alias is set.
  - Use sf project deploy start --verbose for more details.

## License
MIT or project-specific license. Update as needed.
