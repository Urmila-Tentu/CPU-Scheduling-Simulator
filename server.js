const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();

app.use(express.json());
app.use(express.static("web"));

app.post("/run", (req, res) => {

    const inputData = req.body.input;

    fs.writeFileSync("input.txt", inputData);

    exec("./scheduler < input.txt", (error, stdout, stderr) => {
        if (error) {
            res.json({ error: stderr || "Execution failed" });
        } else {
            res.json({ output: stdout });
        }
    });
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});