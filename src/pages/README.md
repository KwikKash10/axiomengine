# Checkout Module

This module provides a comprehensive checkout experience for the GetPaid App, integrating with Stripe for secure payment processing.

## Overview

The checkout page allows users to complete their purchase of subscription plans (monthly/yearly) or one-time purchases (lifetime access). It's designed to be user-friendly while providing all necessary information about the plan the user is purchasing.

## Features

- Clean, user-friendly checkout interface
- Secure Stripe integration
- Support for coupon codes
- Responsive design for all devices
- Clear error handling and success messaging
- Back navigation to plan selection

## Usage

### URL Parameters

The checkout page accepts the following URL parameters:

1. `plan` (required): The type of plan being purchased
   - Values: `monthly`, `yearly`, `lifetime`
   - Example: `/checkout?plan=monthly`

2. `coupon` (optional): Coupon code for discounts
   - Example: `/checkout?plan=yearly&coupon=SAVE50`

### Integration with Pricing Page

The Pricing page is configured to direct users to the checkout page with the correct plan parameter. When a user clicks on a plan button, they are redirected to:

```
/checkout?plan=[plan-type]
```

### Payment Processing

The checkout page uses the `paymentService` to create a Stripe checkout session:

```typescript
const result = await paymentService.createCheckoutSession(
  userId,
  planType,
  mode // 'subscription' or 'payment'
);
```

Once the session is created, the user is redirected to Stripe's hosted checkout page to complete their payment securely.

## Success and Cancellation Handling

After completing or canceling the payment on Stripe, users are redirected to:

- Success: `/subscription/success`
- Canceled: `/subscription/canceled`

These pages are already configured in the router.

## Backend Integration

The checkout process relies on the following Supabase Edge Functions:

1. `create-checkout-session`: Creates the Stripe checkout session
2. `stripe-webhook-handler`: Processes the webhook events from Stripe after payment
3. `create-portal-session`: Creates a customer portal session for managing subscriptions
4. `cancel-subscription`: Handles subscription cancellations

## Testing

To test the checkout process without making real payments:

1. Use Stripe's test card numbers (e.g., `4242 4242 4242 4242`)
2. Expiration date: Any future date
3. CVC: Any 3 digits
4. ZIP: Any 5 digits

## Implementation Notes

- The checkout page is protected and requires authentication
- If a user is not logged in, they will be redirected to the login page
- After successful login, they will be redirected back to the checkout page with the selected plan 