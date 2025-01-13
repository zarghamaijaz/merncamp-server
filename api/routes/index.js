import express from "express";

const router = express.Router();

router.get('/test', async (req, res) => {
    return res.json({ok: true});
})

module.exports = router;