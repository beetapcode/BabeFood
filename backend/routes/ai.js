const express = require('express');
const aiController = require('../controllers/aiController');

const router = express.Router();

router.post('/chat', aiController.chat);

router.post('/clear-cache', async (req, res) => {
	try {
		const { conversationId } = req.body || {};
		if (!conversationId) return res.status(400).json({ error: 'Missing conversationId' });
		if (aiController && typeof aiController.clearCache === 'function') {
			return aiController.clearCache(req, res);
		}
		return res.status(500).json({ error: 'Clear cache not implemented' });
	} catch (err) {
		return res.status(500).json({ error: 'Server error' });
	}
});

router.get('/models', async (req, res) => {
	try {
		const apiKey = process.env.GEMINI_API_KEY;
		if (!apiKey) return res.status(500).json({ error: 'Server missing GEMINI_API_KEY' });

		const urls = [
			`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
			`https://generativelanguage.googleapis.com/v1beta2/models?key=${apiKey}`,
		];

		const axios = require('axios');
		let lastErr = null;
		for (const url of urls) {
			try {
				const r = await axios.get(url, { timeout: 10000 });
				return res.json(r.data);
			} catch (err) {
				lastErr = err;
			}
		}

		if (lastErr && lastErr.response) {
			return res.status(lastErr.response.status).json(lastErr.response.data || { error: 'Unknown error' });
		}
		return res.status(500).json({ error: 'Unable to list models' });
	} catch (error) {
		return res.status(500).json({ error: 'Server error listing models' });
	}
});

module.exports = router;
