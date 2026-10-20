import { app } from './app';

// Loopback-only by design: this lab is not a public deployment.
app.listen(3000, '127.0.0.1', () => {
  console.log('Pagination Contract Lab is running at http://localhost:3000');
});
