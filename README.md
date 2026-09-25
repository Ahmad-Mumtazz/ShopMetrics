# ShopMetrics

ShopMetrics is a React storefront and merchant workspace demo. Customers can browse products, save favorites, compare products, use merchant promotions, manage delivery addresses, place orders, and contact the store. Merchants can manage inventory, fulfillment, promotions, returns, support, product descriptions, and reviews.

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Use `npm run lint` to check source files, `npm run build` to create the production bundle, and `npm run preview` to serve that bundle locally.

## Data and hosting

This demo saves account, catalog, cart, and order data in the browser's local storage. Data is local to that browser profile; it does not sync across devices or provide production authentication, payment processing, or parcel tracking integrations. Most seeded product photos use the catalog in `src/data/photoCatalog.json`; images load from external URLs and need an internet connection.

Customer views use clean paths such as `/shop`, `/deals`, and `/orders`. A production static host must serve `index.html` as a fallback for these paths so direct visits and browser refreshes work.
