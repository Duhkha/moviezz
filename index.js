const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static('public')); // Serve static files from 'public' directory

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/movies', (req, res) => {
    const moviesDir = path.join(__dirname, 'media/movies');
    fs.readdir(moviesDir, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory');
        }
        res.json(files); // Send list of movies
    });
});

app.get('/tvshows', (req, res) => {
    const tvShowsDir = path.join(__dirname, 'media/tvshows');
    fs.readdir(tvShowsDir, (err, shows) => {
        if (err) {
            return res.status(500).send('Unable to scan directory');
        }
        const showList = {};
        shows.forEach(show => {
            const episodes = fs.readdirSync(path.join(tvShowsDir, show));
            showList[show] = episodes;
        });
        res.json(showList); // Send list of shows with episodes
    });
});

app.get('/video', (req, res) => {
    const type = req.query.type; // 'movie' or 'tvshow'
    const name = req.query.name;
    const episode = req.query.episode; // Only for TV shows
    let videoPath;

    if (type === 'movie') {
        videoPath = path.join(__dirname, `media/movies/${name}`);
    } else if (type === 'tvshow') {
        videoPath = path.join(__dirname, `media/tvshows/${name}/${episode}`);
    }

    if (!videoPath || !fs.existsSync(videoPath)) {
        return res.status(404).send('Video not found');
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, {start, end});
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
