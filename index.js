require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const httpStatusText = require('./utils/httpStatusText');

const app = express();

app.use(bodyParser.json());

const port = process.env.PORT;

const url = process.env.MONGO_URL;

// Import the Counter model
const Counter = require('./models/counter'); // Adjust the path according to your project structure

mongoose.connect(url).then(() => {
    console.log("mongodb server started");

    // Initialize the product counter
    initializeCounter();
}).catch(err => {
    console.error("Failed to connect to MongoDB:", err);
});

// Function to initialize the product counter
const initializeCounter = async () => {
    try {
        await Counter.findOneAndUpdate(
            { name: 'productCounter' },
            { name: 'productCounter', value: 0 },
            { upsert: true }
        );
        console.log('Counter initialized');
    } catch (error) {
        console.error('Error initializing counter:', error);
    }
};


const categoryRouter = require('./Router/categories.router');
const subCategoryRouter = require('./Router/subcategories.router');
const productRouter = require('./Router/products.router');
const productContainRouter = require('./Router/productContain.router');
const reviewRouter = require('./Router/reviews.router');
const userRouter = require('./Router/users.router');
const favoritesRouter = require('./Router/favorite.router');

app.use('/api/categories', categoryRouter);
app.use("/api/subCategories", subCategoryRouter);
app.use("/api/products", productRouter);
app.use("/api/productContain", productContainRouter);
app.use("/api/products", reviewRouter);
app.use("/api/users", userRouter);
app.use("/api/favorites", favoritesRouter);

app.all("*", (req, res, next) => {

    res.status(400).json({
        status: httpStatusText.ERROR,
        data: null,
        message: "URL may be wrong"
    });
});

app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        status: err.statusText || httpStatusText.ERROR,
        data: null,
        message: err.message || "some thing wrong"
    });
});


app.listen(port, () => {
    console.log(`listening on port ${port}`);
})