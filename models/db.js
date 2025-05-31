/**
 * Database config and initialization
 */
const mongoose = require('mongoose');

const dbUrl = process.env.MONOGDB_STRING;

const connectWithRetry = async function () {
    try {
        await mongoose.connect(dbUrl);
        console.log("🗄️ 🗄️ 🗄️   ✅ ✅ Mongodb connected ✅ ✅ ");

    } catch (error) {
        console.error('Failed to connect to mongo on startup - retrying in 5 sec', error);
        setTimeout(connectWithRetry, 5000);
    }

};
connectWithRetry();

module.exports = mongoose;
