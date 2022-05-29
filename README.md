# Oceana Engaging Networks Overlay

This project makes it easy to add an Overlay with a custom Engaging Networks Form to your website.

## How to use

1. Add the script below to the page:

```html
<script
  defer="defer"
  src="https://aaf1a18515da0e792f78-c27fdabe952dfc357fe25ebf5c8897ee.ssl.cf5.rackcdn.com/1997/oceana-en-overlay.js"
  data-title="This is my title!"
  data-subtitle="This is my subtitle"
  data-paragraph="This is my paragraph"
  data-image="https://source.unsplash.com/random/1920x1080"
></script>
```

2. You can add any options as a data attribute on the `script` tag.

## Options

Every option should be set as a data attribute on the `script` tag. All options are optional, except for the `data-title`, `data-subtitle`, `data-paragraph`, and `data-image` options, which are empty by default.

- **data-cookie_name**: The name of the cookie that will be used to store the closed state. Defaults to `hideOverlay`.
- **data-cookie_expiry**: The number of days until the cookie expires. Default is `1`.
- **data-title** - Title of the overlay.
- **data-subtitle** - Subtitle of the overlay.
- **data-paragraph** - Text of the overlay.
- **data-image** - Background Image of the overlay.
- **data-button_label** - Label of the donate button. Defaults to `Donate Now`.
- **data-amounts** - CSV of numeric amount preset options. Defaults to `35, 75, 100, 250, 500`.
- **data-other_label** - Label of Other Amount field. Defaults to `$ other`. If empty, the field will be hidden.
- **data-donation_form** - URL of the donation page.
- **data-trigger** - How the user will trigger the overlay. Defaults to `0`, which means the overlay will automatically trigger when the page loads. Check the **Trigger Options** section for more information.
- **data-start_unix** - Unix seconds timestamp of when to start showing the overlay. Defaults to `0` for no start time.
- **data-end_unix** - Unix seconds timestamp of when to stop showing the overlay. Defaults to `Infinity` for no end time.

## Trigger Options

- **ANY_NUMBER** (example: `2`) - The overlay will open after NUMBER seconds.
- **ANY_PIXEL** (example `400px`) - The overlay will open when the user scrolls the page for PIXEL pixels.
- **ANY_PERCENT** (example `50%`) - The overlay will open when the user scrolls the page for PERCENT of the page.
- **exit** (example `exit`) - The overlay will open when the user moves their mouse out of the page (exit intent).

## Development

Project's code is on the `src/app.ts` file. Styling changes must be on `src/sass` folder.

## Install Dependencies

1. `npm install`

## Deploy

1. `npm run build` - Builds the project
2. `npm run start` - Watch for changes and rebuilds the project

It's going to create a `dist` folder, where you can get the `oceana-en-overlay.js` file and publish it.

Currently it's published on:  
https://aaf1a18515da0e792f78-c27fdabe952dfc357fe25ebf5c8897ee.ssl.cf5.rackcdn.com/1997/oceana-en-overlay.js
