# Green Plastwood website

Static website for GREEN PLASTWOOD, the WPC brand of SNG Eco India Pvt. Ltd. Plain HTML, CSS and JavaScript: no build step.
Upload the whole folder as it is. `index.html` is the home page.

## Pages
- Main: `index.html`, `about.html`, `manufacturing.html`, `products.html`, `gallery.html`, `certificate.html`, `resources.html`, `contact.html`
- Products (5): `product-wpc-door-frames.html` (WPC Chaukhat), `product-wpc-solid-doors.html` (WPC Doors),
  `product-wpc-boards-sheets.html` (WPC Sheets & Boards), `product-wpc-window-frames.html`, `product-wpc-louvers.html`.
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
- `docs/` the 8 catalogue PDFs. The download buttons need this folder next to the pages.

## Before going live
1. `assets/gp-config.js`: put the Formspree form address in `formEndpoint` (until then forms go to the thank-you page but no e-mail is sent),
   and the Google Analytics / Meta Pixel IDs if they are used.
2. Site address: pages, `sitemap.xml`, `robots.txt` and `llms.txt` use `https://whitinkdesignstudio.github.io/Green-Plastwood/`.
   Replace it in all files when the site moves to its own domain.
3. Footer links "Privacy Policy", "Terms of Service" and "Sitemap" have no pages yet.

## Still needed from the client
- Founders' photos and approval of the founders' message.
- Real plant photos and factory film (the current ones are illustrations).
- Business-partner cities, export countries and unit locations for the map on the About page.
- One fixed YouTube video for the home page; real customer reviews.
- Products: warranty terms, double rebate and window frame drawings, minimum order for chaukhat, window frames and louvers.

`CHANGES.md` lists every change made to the site.
