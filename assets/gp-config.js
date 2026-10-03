/* ==========================================================================
   GREEN PLASTWOOD — SITE SETTINGS (edit only this file)
   ========================================================================== */
window.GP_CONFIG = {
  // Contact — ⚠ confirm the sales number with the client
  phone: '+919016336119',              // used for tel: links
  phoneDisplay: '+91 90163 36119',
  whatsapp: '919016336119',            // country code + number, no + or spaces
  email: 'info@greenplastwood.com',

  // Lead delivery — paste a form endpoint to receive every enquiry by email / sheet.
  // Formspree: create a free form at formspree.io with the client's email → paste https://formspree.io/f/xxxxxxx
  // (Google Apps Script web-app URL also works — any endpoint that accepts POST form-data.)
  formEndpoint: '',

  // Tracking — paste IDs when accounts are ready (leave '' to disable)
  gtmId: '',               // e.g. 'GTM-XXXXXXX'  (if you use GTM, you can leave the IDs below empty)
  ga4Id: '',               // e.g. 'G-XXXXXXXXXX'
  googleAdsId: '',         // e.g. 'AW-123456789'
  googleAdsLeadLabel: '',  // conversion label for the Lead action, e.g. 'AbCdEfGhIjKlMn'
  metaPixelId: '',         // e.g. '123456789012345'

  // Videos: paste a YouTube link or ID for each slot. Empty = the card opens our YouTube channel.
  youtubeChannel: 'https://www.youtube.com/@greenplastwoodindia',
  videos: {
    corporate: '',      // Home + Gallery: corporate / brand film
    factory: '',        // Manufacturing + Gallery: factory walk-through
    installation: '',   // Door Frames page + Gallery: WPC chaukhat installation
    testimonials: '',   // Home: customer testimonials (playlist or video)
    products: ''        // Gallery: product features
  },

  thankYouPage: 'thank-you.html'
};
