const express = require('express');
const router = express.Router();
const Saraha = require('../models/saraha');

// Add a new Saraha document
router.post('/add', async (req, res) => {
    try {
        const { uid, username, message, date, numberToOrderBy } = req.body;
        const newSaraha = new Saraha({ uid, username, message, date, numberToOrderBy });
        const savedSaraha = await newSaraha.save();
        res.status(201).json(savedSaraha);
    } catch (error) {
        res.status(400).json({ message: 'Error adding Saraha', error });
        console.log(error);
    }
});

// Get all Saraha documents with pagination, sorting, search, and count
router.get('/all', async (req, res) => {
    try {
        const { page = 1, limit = 10, sortOrder = 'asc', search = '' } = req.query;

        // Pagination calculation
        const pageNum = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNum - 1) * pageSize;

        // Sorting logic for numberToOrderBy
        const sortDirection = sortOrder === 'asc' ? 1 : -1;
        const sortCriteria = { numberToOrderBy: sortDirection };

        // Search filter (using username as an example)
        const searchFilter = search
            ? { username: new RegExp(search, 'i') } // Case-insensitive search
            : {};

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
router.put('/:id', async (req, res) => {
    try {
        const updatedSaraha = await Saraha.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedSaraha) {
            return res.status(404).json({ message: 'Saraha not found' });
        }
        res.status(200).json(updatedSaraha);
    } catch (error) {
        res.status(400).json({ message: 'Error updating Saraha', error });
    }
});

// Delete Saraha by ID
router.delete('/:id', async (req, res) => {
    try {

        if(req.params.id=="all"){
            try {
                await Saraha.deleteMany({});
                res.status(200).json({ message: 'All Saraha documents deleted successfully' });
            } catch (error) {
                res.status(500).json({ message: 'Error deleting all Saraha documents', error });
            }

        }else{

            const deletedSaraha = await Saraha.findByIdAndDelete(req.params.id);
            if (!deletedSaraha) {
                return res.status(404).json({ message: 'Saraha not found' });
            }
            res.status(200).json({ message: 'Saraha deleted successfully' });
        }

    } catch (error) {
        res.status(500).json({ message: 'Error deleting Saraha', error });
    }
});



module.exports = router;
