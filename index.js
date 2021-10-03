const express = require("express");
const axios = require("axios");
const app = express();
const compression = require("compression");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
const cron = require("node-cron");

const port = process.env.PORT || 3001;
app.use(compression());
app.use(helmet());

app.listen(port, function () {
  console.log("Coronavirus Tracker service on port 💣", port);
  getCovidData();
  cron.schedule("*/10 * * * *", () => {
    console.log("CRON: fetching data : ", Date());
    getCovidData();
  });
});

app.get("/covid_data", function (req, res) {
  const data = readFromFileSystem("/covid_data.txt", res);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send(data);
});

function getCovidData() {
  axios
    .get("https://www.mohfw.gov.in/data/datanew.json")
    .then(function (res) {
      saveTofileSystem(res.data, "covid_data.txt");
    })
    .catch(function (err) {
      console.log(
        "ERROR: while fetching data from source, retrying in 10mins\n",
        err
      );
    });
}

function saveTofileSystem(obj, fileName) {
  fs.writeFileSync(
    path.join(__dirname + `/${fileName}`),
    JSON.stringify(obj),
    function (err) {
      if (err) {
        return console.log("ERROR: while writing to file\n", err);
      }
    }
  );
}

function readFromFileSystem(fileName) {
  return fs.readFileSync(
    path.join(__dirname + `/${fileName}`),
    "utf8",
    function (err, data) {
      if (err) {
        console.log("ERROR: while reading file " + fileName + "\n", err);
        return;
      }
    }
  );
}
