const reviewers = [
  'Ava Thompson', 'Noah Williams', 'Mia Chen', 'Liam Patel', 'Sofia Garcia', 'Ethan Brooks',
  'Amara Okafor', 'Lucas Martin', 'Zara Ahmed', 'Oliver Wilson', 'Isabella Moore', 'Arjun Singh',
  'Layla Hassan', 'Mason Clark', 'Nina Kim', 'Leo Turner', 'Aisha Khan', 'Evelyn Davis',
  'Mateo Rivera', 'Grace Lee', 'Omar Farooq', 'Chloe Bennett', 'Henry Scott', 'Priya Shah'
];

const comments = [
  'The quality feels better than I expected, and it has been easy to use in my regular routine.',
  'A thoughtful design and a useful addition. I have reached for the {product} several times already.',
  'It arrived in good condition and matches the listing. Overall, a very satisfying purchase.',
  'I appreciate how practical this is. It does what I need without making things complicated.',
  'The finish and overall presentation are lovely. I would consider buying this as a gift too.',
  'A dependable everyday choice. It has fit naturally into the way I use products like this.',
  'Good value for the price, with a clean look and a pleasant experience using the {product}.',
  'This has been useful around the house and feels like it was selected with care.',
  'The {product} is as described and has worked well for me so far. Happy with the purchase.',
  'Simple, well presented, and convenient. It made a small but welcome improvement to my day.',
  'I bought the {product} after comparing a few options and am pleased with the design and usability.',
  'The details are nicely considered, and it feels comfortable to include in everyday use.',
  'A pleasant surprise. The quality, appearance, and usefulness all met my expectations.',
  'The {product} is straightforward to use and has been a good fit for what I needed.',
  'The item arrived promptly and looks just like the photos. I am glad I chose it.',
  'Practical and attractive at the same time. I would recommend it to someone looking for this type of item.',
  'I have used the {product} regularly and appreciate how easily it fits into my routine.',
  'A solid purchase with a polished appearance. The product information was helpful too.',
  'Everything was as expected, and the overall experience has been positive.',
  'Useful, nicely finished, and easy to recommend. I would happily order from this collection again.',
  'The {product} feels thoughtfully made and has been a reliable choice for everyday use.',
  'I am pleased with the quality and how well it suits my needs. Would buy again.',
  'A nice balance of function and style. It has quickly become one of my regular picks.',
  'The item was carefully presented and has performed well. Very happy with this order.'
];

const ratings = [5, 4, 5, 5, 4, 5, 4, 5, 3, 5, 4, 5, 5, 4, 5, 4, 5, 5, 4, 5, 4, 5, 4, 5];

export function createDemoReviews(product) {
  return reviewers.map((customerName, index) => ({
    id: `${product.id || product.name}-demo-review-${index + 1}`,
    customerName,
    rating: ratings[index],
    comment: comments[index].replaceAll('{product}', product.name),
    isDemoReview: true
  }));
}

export function ensureDemoReviews(products) {
  return products.map(product => {
    let demoIndex = 0;
    const reviews = (product.reviews || []).map(review => {
      if (!review.isDemoReview || review.id) return review;
      demoIndex += 1;
      return { ...review, id: `${product.id || product.name}-demo-review-${demoIndex}` };
    });
    const demoReviewCount = reviews.filter(review => review.isDemoReview).length;
    const reviewIds = new Set(reviews.map(review => review.id));
    const deletedIds = new Set(product.deletedDemoReviewIds || []);
    const missingDemoReviews = createDemoReviews(product).slice(demoReviewCount).filter(review => !reviewIds.has(review.id) && !deletedIds.has(review.id));
    if (!missingDemoReviews.length) return product;
    return {
      ...product,
      reviews: [...reviews, ...missingDemoReviews]
    };
  });
}
