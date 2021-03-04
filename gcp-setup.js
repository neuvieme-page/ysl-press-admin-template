var fs = require('fs');

if (process.env.NODE_ENV === 'production') {
  fs.writeFile('gcloud-auth.json', process.env.GCP_CREDENTIALS, (err) => {
    console.log(err)
  });
}
