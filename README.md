# Greenplastwood website

Static website for GREENPLASTWOOD, the WPC brand of SNG Eco India Pvt. Ltd. Plain HTML, CSS and JavaScript: no build step.
Upload the whole folder as it is. `index.html` is the home page.

## Pages
- Main: `index.html`, `about.html`, `manufacturing.html`, `products.html`, `gallery.html`, `certificate.html`, `resources.html`, `contact.html`
- Products (6): `product-wpc-door-frames.html` (WPC Chaukhat), `product-wpc-window-frames.html` (WPC Window Frame),
  `product-wpc-solid-doors.html` (WPC Doors), `product-wpc-boards-sheets.html` (WPC Sheets & Boards),
  `product-wpc-louvers.html` (PVC Panel; file name kept for old links), `product-recycled-plastic-sheet.html`.
  `products.html` and the 6 product pages use `assets/gp-redesign.css` and `assets/gp-redesign.js` (Oct 2026 redesign).
  A sub-category opens with a link such as `product-wpc-solid-doors.html#type-3-layer`.
- Blogs: `blogs.html` and 8 articles `blog-*.html`
- Guides: 7 pages `guide-*.html`
- Ad landing pages: `lp-*.html` (not in the menu, hidden from search engines)
- `thank-you.html` (shown after a form is sent)
- Redirect pages (old addresses, keep them): `product.html`, `product-detail.html`, `contact-us.html`, `product-wpc-boards.html`,
  `product-wpc-pvc-sheets.html`, `product-wpc-windows.html`, `product-pvc-louvers.html`, `product-wpc-3-layer-doors.html`, `product-wpc-3-layer-boards.html`

## Folders
- `assets/` styles and scripts. `gp-type.css` holds the fonts and the text sizes for the whole site. `assets/fonts/` holds the Questrial font files.
- `images/` all images and the manufacturing film.
- `docs/` the catalogue PDFs. Not in this working zip; it stays on the server. The download buttons need it next to the pages.
- `_data/`, `_prompts/`, `_new-images/`: working files only. Never upload them.

## Before going live
1. `assets/gp-config.js`: put the web-app address of the form mailer in `formEndpoint` (setup steps are in the `email-setup` folder that came
   with the site). Until then the page forms open the thank-you page but no e-mail is sent; the pop-up forms already go to WhatsApp.
   Add the Google Analytics / Meta Pixel IDs in the same file if they are used.
2. Site address: pages, `sitemap.xml`, `robots.txt` and `llms.txt` use `https://sngecoindia.com/`.
   Replace it in all files when the site moves to its own domain.
3. Footer links "Privacy Policy" and "Terms of Service" have no pages yet.
4. Confirm the company e-mail address with the client (see CHANGES.md, Update 33).

## Still needed from the client
- Founders' photos and approval of the founders' message.
- Real plant photos and factory film (the current ones are illustrations).
- Business-partner cities, export countries and unit locations for the map on the About page.
- One fixed YouTube video for the home page; real customer reviews.
- Products: warranty terms, double rebate and window frame drawings, minimum order for chaukhat, window frames and louvers.

`CHANGES.md` lists every change made to the site.
