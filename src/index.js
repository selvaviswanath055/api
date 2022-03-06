const express = require('express');
const app = express();

const port = process.env.PORT || 443

app.get('/', (req,res) => res.send("testing nodemon"));
app.listen(port, ()=> console.log(`listening on ${port}`));