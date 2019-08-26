# Polar Weight Sync
The intent is to build an endpoint to receive [notifications](http://developer.withings.com/oauth2/#tag/notify) from Withings when a user's weight has been updated, then post the weight data to the [Polar Flow App](https://flow.polar.com)

## Installation

1. Run: `npm install` from the root directory
1. Rename `.env-example` to `.env` and update with your Polar Flow user credentails

## Use

1. Update the `index.js run()` method with the date and the weight you wish to input.
1. Run `npm start`

## Deploy
TBD.
