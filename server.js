cat > server.js << 'EOF'
require('dotenv').config();
const app = require('./src/app');

// Buat Vercel butuh export
module.exports = app;

// Kalo jalan di lokal / Termux baru listen
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
EOF
