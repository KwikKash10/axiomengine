# Release v1.5.0

## Overview
This stable release updates the Stripe price IDs and fixes issues with the plan selection process. The release also includes improvements to the user interface and checkout experience.

## Release Details
- **Commit Hash**: 4ca1c74885057e6e84757e1a7ccc7191b11948d2
- **Author**: KwikKash10
- **Timestamp**: Tue, 15 Apr 2025 21:40:34 +0100
- **Commit Message**: Update Stripe price IDs and fix plan selection reload issue
- **Branch Name**: stable-release-1.0
- **Tag Name**: v1.5.0
- **Pull Request**: https://github.com/KwikKash10/checkout/pull/7

## Deployment Status
- **Netlify**: Successfully deployed to https://checkout.getino.app
- **Vercel**: Successfully deployed to https://checkout-giqovl6gf-kwikkashs-projects.vercel.app

## Changes

### Updated Stripe Price IDs
- **Lifetime**: `price_1RE8O72KitrBpBuO12sd4L3M`
- **Yearly**: `price_1RE8Lt2KitrBpBuOYYbxSAKp`
- **Monthly**: `price_1RE4uK2KitrBpBuOLcp4UXHX`

These price IDs have been updated in:
- src/pages/api/create-checkout-session.js
- netlify/functions/create-checkout-session.js
- stripe-check.js

### Bug Fixes
- Fixed issue where the Stripe Elements form wasn't reloading when switching between plan types
- Added timestamp parameter to URLs to ensure proper reinitialization of payment forms
- Removed redundant hash fragments from checkout links
- Modified checkout form initialization to properly handle plan changes

### UI Improvements
- Updated loading text from "Loading payment form..." to "Preparing secure checkout..."
- Fixed styling inconsistencies in payment form

## Testing Notes
All changes have been tested on both development and production environments. The checkout process has been verified to work correctly with all three plan types (monthly, yearly, and lifetime).

## Rollback Instructions
If issues are encountered, use the following git command to revert to the previous stable version:
```
git push origin v1.4.0:stable-release-1.0 -f
``` 