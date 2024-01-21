# YpAnalytics

The `YpAnalytics` class extends the `YpCodeBase` class and is responsible for handling analytics tracking for Google Analytics and Facebook Pixel. It includes methods for setting up Google Analytics, tracking Facebook Pixel events, setting community-specific tracking IDs, and sending analytics data to the configured trackers.

## Properties

| Name                 | Type                        | Description                                      |
|----------------------|-----------------------------|--------------------------------------------------|
| pixelTrackerId       | string \| undefined         | The ID used for Facebook Pixel tracking.         |
| communityTrackerId   | string \| undefined         | The ID used for community-specific Google Analytics tracking. |
| communityTrackerIds  | Record<string, boolean>     | A record of community tracker IDs that have been set up. |

## Methods

| Name                        | Parameters                                      | Return Type | Description                                                                 |
|-----------------------------|-------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| setupGoogleAnalytics        | domain: YpDomainData                            | void        | Sets up Google Analytics tracking using the provided domain data.           |
| facebookPixelTracking       | event: string, detailedEvent: string \| undefined | void        | Tracks a Facebook Pixel event, optionally with a detailed event description. |
| setCommunityPixelTracker    | trackerId: string \| undefined                  | void        | Sets the Facebook Pixel tracker ID for the community.                       |
| setCommunityAnalyticsTracker| trackerId: string \| undefined                  | void        | Sets the Google Analytics tracker ID for the community.                     |
| sendToAnalyticsTrackers     | a: string\|object, b: string\|object, c: string\|object, d: string\|object\|undefined, e: string\|object\|undefined, f: string\|object\|undefined | void | Sends analytics data to the configured trackers, with support for multiple parameters. |
| sendLoginAndSignup          | userId: number, eventType: string, authProvider: string, validationError: string\|undefined | void | Sends analytics data related to login and signup events.                    |

## Examples

```typescript
// Example usage of setting up Google Analytics
const ypAnalytics = new YpAnalytics();
const domainData = {
  public_api_keys: {
    google: {
      analytics_tracking_id: 'UA-XXXXX-Y'
    }
  },
  google_analytics_code: 'UA-XXXXX-Y'
};
ypAnalytics.setupGoogleAnalytics(domainData);

// Example usage of tracking Facebook Pixel event
ypAnalytics.setCommunityPixelTracker('1234567890');
ypAnalytics.facebookPixelTracking('pageview');

// Example usage of sending analytics data
ypAnalytics.sendToAnalyticsTrackers('send', 'event', 'Category', 'Action', 'Label', { dimension1: 'value' });
```