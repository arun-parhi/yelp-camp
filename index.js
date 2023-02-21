const express = require('express');

const app = express();

app.get('/', (req, res) => { 
    res.send("Hello from Yelp Camp !!");
})

const port = process.env.PORT || 3000;
app.listen(port, () => { 
    console.log("Serving on port 3000");
})