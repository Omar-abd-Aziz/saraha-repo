const express = require('express');
const router = express.Router();
const Saraha = require('../models/saraha');
const verifyToken = require('../middleware/verifyToken'); // Path to your verifyToken middleware

// Add a new Saraha document
router.post('/add', async (req, res) => {
    try {
        const { uid,sentTo, sentFrom , username, message, date, numberToOrderBy } = req.body;
        const newSaraha = new Saraha({ uid, sentTo, sentFrom, username, message, date, numberToOrderBy });
        const savedSaraha = await newSaraha.save();
        res.status(201).json(savedSaraha);
    } catch (error) {
        res.status(400).json({ message: 'Error adding Saraha', error });
        console.log(error);
    }
});



// Get all Saraha documents for account id with pagination, sorting, search, and count 
router.get('/all', verifyToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, sortOrder = 'asc', search = '' } = req.query;

        // Pagination calculation
        const pageNum = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNum - 1) * pageSize;

        // Sorting logic for numberToOrderBy
        const sortDirection = sortOrder === 'asc' ? 1 : -1;
        const sortCriteria = { numberToOrderBy: sortDirection };

        // Filter by accountId ("sentTo" field) and search (optional)
        const searchFilter = {
            sentTo: req.user.accountId,  // Ensure only records with matching accountId
            ...(search && { username: new RegExp(search, 'i') })  // Case-insensitive search
        };

        // Fetch paginated, sorted, and filtered Saraha documents
        const sarahaDocs = await Saraha.find(searchFilter)
            .sort(sortCriteria)
            .skip(skip)
            .limit(pageSize);

        // Get the total count of documents that match the filter
        const totalCount = await Saraha.countDocuments(searchFilter);

        res.status(200).json({
            sarahaDocs,
            totalCount,
            currentPage: pageNum,
            totalPages: Math.ceil(totalCount / pageSize),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Saraha records', error });
    }
});




// Get only Saraha messages documents for account id with pagination, sorting, search, and count that messages have showMessageForAll==true
router.post('/allpins', async (req, res) => {  // Use POST method
    try {
        const { page, limit, sortOrder, search = '', accountId } = req.body;

        // Check if accountId is provided
        if (!accountId) {
            return res.status(400).json({ message: 'Account ID is required' });
        }

        // Pagination calculation
        const pageNum = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNum - 1) * pageSize;

        // Sorting logic for numberToOrderBy
        const sortDirection = sortOrder === 'asc' ? 1 : -1;
        const sortCriteria = { numberToOrderBy: sortDirection };

        // Filter by accountId ("sentTo" field) and search (optional), and showMessageForAll==true
        const searchFilter = {
            sentTo: accountId,          // Use accountId from the request body
            showMessageForAll: true,    // Only messages with showMessageForAll set to true
            ...(search && { username: new RegExp(search, 'i') })  // Case-insensitive search
        };

        // Fetch paginated, sorted, and filtered Saraha documents
        const sarahaDocs = await Saraha.find(searchFilter)
            .sort(sortCriteria)
            .skip(skip)
            .limit(pageSize);

        // Get the total count of documents that match the filter
        const totalCount = await Saraha.countDocuments(searchFilter);

        res.status(200).json({
            sarahaDocs,
            totalCount,
            currentPage: pageNum,
            totalPages: Math.ceil(totalCount / pageSize),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Saraha records', error });
    }
});




















// Get one Saraha by ID
router.get('/:id', async (req, res) => {
    try {
        const saraha = await Saraha.findById(req.params.id);
        if (!saraha) {
            return res.status(404).json({ message: 'Saraha not found' });
        }
        res.status(200).json(saraha);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Saraha', error });
    }
});

// Edit Saraha by ID
// router.put('/:id', async (req, res) => {
//     try {
//         const updatedSaraha = await Saraha.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
//         if (!updatedSaraha) {
//             return res.status(404).json({ message: 'Saraha not found' });
//         }
//         res.status(200).json(updatedSaraha);
//     } catch (error) {
//         res.status(400).json({ message: 'Error updating Saraha', error });
//     }
// });



router.put('/:id', verifyToken, async (req, res) => {
    try {
        // Find the Saraha document by ID
        const saraha = await Saraha.findById(req.params.id);
        
        if (!saraha) {
            return res.status(404).json({ message: 'Saraha not found' });
        }

        // Check if the current user is authorized to edit this Saraha
        if (saraha.sentTo.toString() !== req.user.accountId) {
            return res.status(403).json({ message: 'Unauthorized to edit this Saraha' });
        }

        // Proceed to update if authorized
        const updatedSaraha = await Saraha.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        
        res.status(200).json(updatedSaraha);
    } catch (error) {
        res.status(400).json({ message: 'Error updating Saraha', error });
    }
});



// Delete Saraha by ID
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        if (req.params.id === "all") {
            // Delete all Saraha documents
            try {
                await Saraha.deleteMany({});
                res.status(200).json({ message: 'All Saraha documents deleted successfully' });
            } catch (error) {
                res.status(500).json({ message: 'Error deleting all Saraha documents', error });
            }
        } else {
            // Find the document first to check if sentTo matches accountId
            const saraha = await Saraha.findById(req.params.id);

            if (!saraha) {
                return res.status(404).json({ message: 'Saraha not found' });
            }

            if (saraha.sentTo.toString() !== req.user.accountId) {
                return res.status(403).json({ message: 'Unauthorized to delete this Saraha' });
            }

            // Proceed to delete if authorized
            await saraha.deleteOne();
            res.status(200).json({ message: 'Saraha deleted successfully' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting Saraha', error });
    }
});




module.exports = router;
