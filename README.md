# yartsmin

Plain HTML, CSS and JavaScript. No build step, no framework.

## Run it locally
Open `index.html` in your browser, or for a proper local server:

    cd ~/Desktop/yartsmin
    python3 -m http.server 8000

then go to http://localhost:8000

## Files
- `index.html`: the page structure and all the text
- `css/style.css`: colours and fonts are at the top in `:root`
- `js/main.js`: interactions (cursor photo trail, scroll reveals, parallax, tilt, drag strip, cart, lightbox, newsletter)
- `images/`: placeholder artwork. Replace these with your own photos, same names, or update the `src` in index.html

## Interactions
- Hero: move the mouse (or tap on a phone) and artworks appear along your trail. It uses every image in the gallery and print strip.
- Headings rise in word by word, gallery images wipe in as you scroll, with light parallax
- Featured product tilts in 3D on hover; the "33 left" ring draws itself and the number counts down
- Print strip: drag sideways with the mouse, swipe on phones
- Gallery: click a piece to open it big; arrows or swipe to move through
- Cart counter is front-end only for now (saved in the browser)

## Hooking things up later
- Newsletter: see the TODO in `js/main.js` (Buttondown, Mailchimp, Brevo...)
- Checkout: swap the add-to-cart buttons for Stripe Payment Links or Lemon Squeezy links, or a real cart like Snipcart

## Deploy
It's a static folder: drag it into Netlify Drop, or push it to GitHub and turn on GitHub Pages / Cloudflare Pages.
