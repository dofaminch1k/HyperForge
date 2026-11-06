# HyperForge

HyperForge is a portfolio concept store for gaming PCs and components. Browse hardware by category, search and compare prices, and save items to a cart that persists between visits. Prices are for demonstration. Checkout and payments are unavailable.

## Publish on GitHub Pages

1. Create a public GitHub repository called `HyperForge`.
2. Extract the ZIP and upload its contents to the repository. Keep `index.html` at the root and preserve the `assets/` directory.
3. Commit the files to `main`.
4. Under **Settings → Pages → Build and deployment**, select **Deploy from a branch**, then **main** and **/(root)**. Click **Save**.
5. When deployment finishes, use **Visit site** in Pages settings. Later commits to the selected branch update the published site.

The project uses plain HTML, CSS and JavaScript. All runtime assets are included. [GitHub Pages publishing guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Run locally

Extract the complete archive and open `index.html` in your browser.

For an optional local HTTP preview, from the directory containing `index.html`, run:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Open [the local store](http://127.0.0.1:8000/).

## Edit the store

- `products.js` holds product names, categories, specifications, EUR prices and original catalog references. Keep each product ID unique and stable so saved carts can identify it.
- `data.js` loads products and persists the cart in browser storage.
- `index.html`, `styles.css` and `store.js` implement the storefront.
- `assets/` contains locally hosted illustrations and branding.
- `effects.js` implements the pixel-card and cursor-grid interactions inspired by [React Bits](https://github.com/DavidHDev/react-bits).

Product details are based on the [ARLT catalog](https://www.arlt.com/). The product images are generated category illustrations.
