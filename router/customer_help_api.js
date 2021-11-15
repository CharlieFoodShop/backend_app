// Load all packages
const express = require('express');

// Load Models
const QuestionAnswer = require('./models/QuestionAnswer');

// Create express router, connect to database
const router = express.Router();

router.get('/get_question_answer', async (req, res) => {
    try {
        let results = await QuestionAnswer.getAllQuestionAnswer();
        return res.status(200).json({ success: true, data: results });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// Export the router
module.exports = router;