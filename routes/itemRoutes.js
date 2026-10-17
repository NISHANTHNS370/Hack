const router = require('express').Router();
const upload = require('../middleware/upload');
const { createItem, getItems, getMatches } = require('../controllers/itemController');

router.get('/', getItems);
router.post('/', upload.single('image'), createItem);
router.get('/:id/matches', getMatches);

module.exports = router;
