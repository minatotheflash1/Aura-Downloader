const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// সরাসরি রুট ডিরেক্টরি থেকে index.html সার্ভ করা
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ভিডিও এক্সট্রাকশন API
app.post('/api/fetch-video', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "অনুগ্রহ করে একটি লিঙ্ক দিন!" });

    try {
        const videoInfo = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            preferFreeFormats: true,
            addHeader: [
                'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'referer:https://www.google.com/'
            ],
            noWarnings: true
        });

        // রেজাল্ট ফিল্টার করা
        const responseData = {
            success: true,
            title: videoInfo.title || "Aura Video",
            thumbnail: videoInfo.thumbnail,
            duration: videoInfo.duration_string || "N/A",
            formats: videoInfo.formats
                .filter(f => f.url && !f.format_id.includes('storyboard'))
                .map(f => ({
                    quality: f.resolution || f.format_note || "Standard",
                    ext: f.ext,
                    size: f.filesize ? (f.filesize / 1024 / 1024).toFixed(2) + ' MB' : 'Link',
                    url: f.url
                })).reverse() // ভালো কোয়ালিটি উপরে দেখানোর জন্য
        };

        res.json(responseData);
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "ভিডিওর তথ্য পাওয়া যায়নি। লিঙ্কটি চেক করুন।" });
    }
});

app.listen(PORT, () => {
    console.log(`Aura Server is running on port ${PORT}`);
});
