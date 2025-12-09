const fs = require('fs');
const path = require('path');
const https = require('https');

const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

const url = 'https://www.gardeauarbres.fr/assets/images/logo_gard_eau_arbres_fini200x200.png';
const dest192 = path.join(iconsDir, 'icon-192x192.png');
const dest512 = path.join(iconsDir, 'icon-512x512.png');

function download(url, dest, cb) {
    const file = fs.createWriteStream(dest);
    https.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(cb);
        });
    }).on('error', function (err) {
        fs.unlink(dest);
        if (cb) cb(err);
    });
}

download(url, dest192, () => {
    console.log('Downloaded icon-192x192.png');
    // Copy to 512 (same image for now)
    fs.copyFileSync(dest192, dest512);
    console.log('Created icon-512x512.png');
});
