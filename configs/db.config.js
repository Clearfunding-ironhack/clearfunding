const mongoose = require('mongoose');
const DB_NAME = "clearfunding";


mongoose.Promise = Promise;
mongoose.connect(process.env.MLAB_CONNECTION)
    .then(() => {
        console.log(`Connected to ${DB_NAME} database.`);
    }).catch((error) => {
        console.error(`Database connection error: ${error}`);
    });
