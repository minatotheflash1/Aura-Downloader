const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const youtubedl = require('youtube-dl-exec');
const path = require('path');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// সরাসরি রুট ডিরেক্টরি থেকে index.html দেখানোর জন্য
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ভিডিও এক্সট্রাকশন API
app.post('/api/fetch-video', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
        const videoInfo = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            preferFreeFormats: true,
            addHeader: ['referer:youtube.com', 'user-agent:Mozilla/5.0']
        });

        res.json({
            success: true,
            title: videoInfo.title,
            thumbnail: videoInfo.thumbnail,
            duration: videoInfo.duration_string || videoInfo.duration,
            formats: videoInfo.formats
                .filter(f => f.url && f.ext !== 'mhtml')
                .map(f => ({
                    resolution: f.resolution || f.format_note || "Audio",
                    ext: f.ext,
                    filesize: f.filesize ? (f.filesize / 1024 / 1024).toFixed(2) + ' MB' : 'N/A',
                    url: f.url
                }))
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch video. Try again." });
    }
});

app.listen(PORT, () => {
    console.log(`Aura Server running on port ${PORT}`);
});