document.getElementById('fetchBtn').addEventListener('click', async () => {
    const url = document.getElementById('videoUrl').value;
    const loader = document.getElementById('loader');
    const result = document.getElementById('result');
    const optionsGrid = document.getElementById('downloadOptions');

    if (!url) return alert("Please paste a URL!");

    // UI Reset
    loader.classList.remove('hidden');
    result.classList.add('hidden');
    optionsGrid.innerHTML = '';

    try {
        const response = await fetch('/api/fetch-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        const data = await response.json();
        
        if (data.success) {
            document.getElementById('thumb').src = data.thumbnail;
            document.getElementById('videoTitle').innerText = data.title;
            document.getElementById('duration').innerText = "Duration: " + data.duration;

            data.formats.forEach(f => {
                const btn = document.createElement('a');
                btn.href = f.url;
                btn.target = "_blank";
                btn.className = 'dl-btn';
                btn.innerHTML = `<i class="fas fa-download"></i> ${f.resolution} (${f.ext})<br><small>${f.filesize}</small>`;
                optionsGrid.appendChild(btn);
            });

            result.classList.remove('hidden');
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert("Something went wrong!");
    } finally {
        loader.classList.add('hidden');
    }
});