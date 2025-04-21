# RELEASE v1.7.1

## Release Date: April 22, 2025

### Overview
This is a patch release that enhances the application's favicons and Safari pinned tab icon to improve the visual appearance across different browsers and platforms.

### Version Info
- Tag: v1.7.1-1 (patch for v1.7.1)
- Branch: stable/v1.7.1

### Changes
1. **Enhanced favicon.ico**
   - Adjusted icon to properly touch the viewbox borders without being cut off
   - Implemented proper scaling across all sizes (16x16 to 512x512)
   - Ensured consistent blue background color (#282958) in browser tabs

2. **Fixed Safari Pinned Tab Icon**
   - Updated safari-pinned-tab.svg with proper padding to prevent content from extending outside the viewbox
   - Fixed safari-pinned-tab.png to use transparent background with black icon as required by Safari
   - Added proper silhouette masking for Safari pinned tab feature

### Affected Files
- public/favicon.ico
- public/favicons/favicon.ico
- public/favicons/safari-pinned-tab.svg
- public/favicons/safari-png/safari-pinned-tab.png

### Technical Notes
- Favicon.ico now includes proper sizing for all standard dimensions (16x16, 32x32, 48x48, 64x64, 128x128, 192x192, 256x256, 384x384, 512x512)
- Larger sizes (256x256, 384x384, 512x512) use PNG encoding within the ICO container for better quality
- Safari pinned tab icon uses solid black with transparency as required by Safari's pinned tab specifications

### Compatibility
- Improved favicon appearance across all major browsers
- Enhanced Safari-specific icon support
- Maintained consistent branding across all platforms 