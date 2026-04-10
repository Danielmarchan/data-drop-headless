import app from './app.js';
import env from './env';

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});
