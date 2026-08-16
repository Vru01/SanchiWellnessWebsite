const mongoose = require('mongoose');
const User = require('../models/User');

// @desc    Search users by ID, email, or phone (Admin Only)
// @route   GET /api/users/admin/search?query=xyz
exports.searchUsers = async (req, res) => {
    const { query } = req.query;

    if (!query || query.trim().length === 0) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    try {
        const orConditions = [
            { email: new RegExp(query, 'i') },
            { phone: new RegExp(query, 'i') },
            { name: new RegExp(query, 'i') }
        ];

        if (mongoose.isValidObjectId(query)) {
            orConditions.push({ _id: query });
        }

        const users = await User.find({ $or: orConditions })
            .select('name email phone pricingTier role')
            .limit(20);

        res.json(users);
    } catch (err) {
        console.error('Error searching users:', err);
        res.status(500).json({ error: 'Failed to search users' });
    }
};

// @desc    Set a user's pricing tier (Admin Only)
// @route   PUT /api/users/admin/set-tier
exports.setPricingTier = async (req, res) => {
    const { userId, pricingTier } = req.body;

    if (!['normal', 'franchise', 'distributor'].includes(pricingTier)) {
        return res.status(400).json({ error: 'Invalid pricing tier' });
    }

    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { pricingTier },
            { new: true, runValidators: true }
        ).select('name email phone pricingTier role');

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ success: true, user });
    } catch (err) {
        console.error('Error setting pricing tier:', err);
        res.status(500).json({ error: 'Failed to update pricing tier' });
    }
};