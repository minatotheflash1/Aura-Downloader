const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Main Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// MULTI-PLATFORM DOWNLOAD API (FB, TikTok, IG, YT)
app.post('/api/fetch-video', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ success: false, error: "Please provide a valid URL" });
    }

    try {
        // yt-dlp Options - High compatibility for social media
        const videoInfo = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: [
                'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'accept-language:en-US,en;q=0.9'
            ],
            // TikTok & IG এর জন্য বিশেষ ফ্ল্যাগ
            youtubeSkipDashManifest: true,
        });

        // রেজাল্ট ফরম্যাটিং
        const formats = videoInfo.formats
            .filter(f => f.url && !f.format_id.includes('storyboard'))
            .map(f => ({
                quality: f.resolution || f.format_note || (f.vcodec !== 'none' ? 'Video' : 'Audio'),
                ext: f.ext,
                size: f.filesize ? (f.filesize / (1024 * 1024)).toFixed(2) + ' MB' : 'Direct Link',
                url: f.url
            }))
            .reverse(); // ভালো রেজোলিউশন আগে দেখাবে

        res.json({
            success: true,
            title: videoInfo.title || "Social Media Video",
            thumbnail: videoInfo.thumbnail,
            duration: videoInfo.duration_string || "N/A",
            source: videoInfo.extractor_key, // FB, TikTok, etc.
            formats: formats
        });

    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({ 
            success: false, 
            error: "Video not found or link is private. Please check the URL." 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Aura API is running on port ${PORT}`);
});
