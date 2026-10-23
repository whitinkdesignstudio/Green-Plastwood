/* ==========================================================================
   GREENPLASTWOOD — SITE SETTINGS (edit only this file)
   ========================================================================== */
window.GP_CONFIG = {
  // Contact — ⚠ confirm the sales number with the client
  phone: '+919016336119',              // used for tel: links
  phoneDisplay: '+91 90163 36119',
  whatsapp: '919016336119',            // country code + number, no + or spaces
  email: 'sales.executive11@sngecoindia.com',

  // Lead delivery by e-mail: send-lead.php (in the website's main folder) runs on the cPanel hosting.
  // Every form on the pages (Contact page form, product pages, blogs, landing pages, newsletter) is e-mailed to
  // sales.executive11@sngecoindia.com, the visitor gets an automatic "we have received your details" e-mail when he gave
  // an e-mail address, and each lead is saved in green-plastwood-leads/leads.csv (cPanel home folder, outside public_html).
  // Inbox, sender and allowed site are set at the top of send-lead.php.  Empty = forms open the thank-you page, nothing is e-mailed.
  formEndpoint: 'send-lead.php',

  // Pop-up forms (Get a Quote, Sample, Business Associate, Catalogue, Certificates): on submit they open WhatsApp with the
  // details already typed in. false = they behave like the other forms (e-mail + thank-you page).
  whatsappForms: true,
  // Also send a copy of every pop-up form to formEndpoint, so the lead is kept even if the visitor never presses "send" in WhatsApp.
  whatsappFormsAlsoEmail: true,

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
