const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/fetch-video', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
        const videoInfo = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            // ফেসবুক রিলস এবং বড় প্ল্যাটফর্মের জন্য নিচের ফ্ল্যাগগুলো জরুরি
            addHeader: [
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language: en-US,en;q=0.9',
                'Sec-Fetch-Mode: navigate'
            ],
            // ভিডিও এক্সট্রাকশন আরও নিখুঁত করতে
            format: 'bestvideo+bestaudio/best',
            youtubeSkipDashManifest: true
        });

        // রেজাল্ট ফিল্টার
        const filteredFormats = videoInfo.formats
            .filter(f => f.url && !f.format_id.includes('storyboard'))
            .map(f => ({
                quality: f.resolution || f.format_note || (f.vcodec !== 'none' ? 'Video' : 'Audio'),
                ext: f.ext,
                size: f.filesize ? (f.filesize / (1024 * 1024)).toFixed(2) + ' MB' : 'Download Link',
                url: f.url
            })).reverse();

        res.json({
            success: true,
            title: videoInfo.title || "Aura Media",
            thumbnail: videoInfo.thumbnail,
            duration: videoInfo.duration_string || "N/A",
            formats: filteredFormats
        });

    } catch (error) {
        console.error("Extraction Error:", error.message);
        res.status(500).json({ 
            success: false, 
            error: "সার্ভার আইপি ফেসবুক দ্বারা ব্লক হয়েছে অথবা লিঙ্কটি প্রাইভেট। দয়া করে আবার চেষ্টা করুন।" 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Aura Server is fixed and running on ${PORT}`);
});
