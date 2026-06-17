import fs from 'fs';
import https from 'https';
import http from 'http';

const id = '1odI2YHFApN39L-jUjo2M1blQ_1TQKcyy';
const url = `https://drive.google.com/uc?export=download&id=${id}`;

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const request = https.get(url, function(response) {
      if (response.statusCode === 302 || response.statusCode === 303) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error('Response status was ' + response.statusCode));
      }
      response.pipe(file);
      file.on('finish', function() {
        file.close(resolve);  
      });
    }).on('error', function(err) { 
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

download(url, './public/background.mp3')
  .then(() => console.log('Downloaded successfully!'))
  .catch(e => console.error('Error downloading:', e));
