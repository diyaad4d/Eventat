fetch('http://localhost:5000/api/vendors/8/public')
  .then(res => res.json())
  .then(data => console.log('RESPONSE:', JSON.stringify(data).substring(0, 500)))
  .catch(err => console.error('ERROR:', err));
