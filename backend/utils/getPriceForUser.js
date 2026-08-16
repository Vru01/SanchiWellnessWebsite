// utils/getPriceForUser.js
// Central place that decides what a given user pays for a given product.
// Never let the frontend send a price — always compute it here.

function getPriceForUser(pricingTier, product) {
    const tier = pricingTier || 'normal';

    if (tier === 'franchise') {
        if (product.franchisePrice === null || product.franchisePrice === undefined) {
            const err = new Error(`Franchise pricing is not configured for "${product.name}".`);
            err.status = 400;
            throw err;
        }
        return { price: product.franchisePrice, original: product.price };
    }

    if (tier === 'distributor') {
        if (product.distributorPrice === null || product.distributorPrice === undefined) {
            const err = new Error(`Distributor pricing is not configured for "${product.name}".`);
            err.status = 400;
            throw err;
        }
        return { price: product.distributorPrice, original: product.price };
    }

    // normal (default / fallback for unknown tiers)
    if (product.discountPrice !== undefined && product.discountPrice !== null) {
        return { price: product.discountPrice, original: product.price };
    }
    return { price: product.price, original: null };
}

module.exports = getPriceForUser;