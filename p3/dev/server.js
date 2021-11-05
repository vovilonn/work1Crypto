const express = require("express");
const fs = require("fs");
const https = require("https");
const path = require("path");
const cors = require("cors");
// require("./js/web3_script");
const privateKey = fs.readFileSync(path.resolve("./etc/ssl/key.pem"));
const certificate = fs.readFileSync(path.resolve("./etc/ssl/cert.pem"));

const credentials = { key: privateKey, cert: certificate };
const app = express();

const httpsServer = https.createServer(credentials, app);

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

app.get("/abi.json", (req, res) => {
    res.sendFile(__dirname + "/public" + "/abi.json");
});

httpsServer.listen(80, "192.168.0.198", () => console.log("Server has been started!"));
