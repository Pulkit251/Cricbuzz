require("chromedriver");

let wd = require("selenium-webdriver");
let chrome = require("selenium-webdriver/chrome");
let browser = new wd.Builder().forBrowser("chrome").build();
let matchId = 30880;
let innings = 1;
let batsmenColumns = [
  "Matches",
  "innings",
  "notOut",
  "runs",
  "highestScore",
  "average",
  "ballsPlayed",
  "strikerate",
  "centuries",
  "doubleCenturies",
  "fifties",
  "fours",
  "sixes",
];
let bowlerColumns = [
  "Matches",
  "innings",
  "balls",
  "runsGiven",
  "wickets",
  "bestinn",
  "bestMatch",
  "economy",
  "average",
  "bowlRate",
  "5WI",
  "10WI",
];
let inningsBatsmen = [];
let inningsBowler = [];
let careerdata = [];
let fs = require("fs");

let playerAdded = 1;
async function getCareerData(url, i, totalPlayers) {
  let browser = new wd.Builder().forBrowser("chrome").build();
  await browser.get(url);
  await browser.wait(
    wd.until.elementLocated(wd.By.css(".table.cb-col-100.cb-plyr-thead"))
  );
  let tables = await browser.findElements(
    wd.By.css(".table.cb-col-100.cb-plyr-thead")
  );
  for (let t in tables) {
    let data = {};
    let rows = await tables[t].findElements(wd.By.css("tbody tr"));
    for (let row of rows) {
      let data1 = {};
      let columns = await row.findElements(wd.By.css("td"));
      let matchType = await columns[0].getAttribute("innerText");
      let keyarr = batsmenColumns;
      if (t == 1) {
        keyarr = bowlerColumns;
      }
      for (let j = 1; j < columns.length; j++) {
        data1[keyarr[j - 1]] = await columns[j].getAttribute("innerText");
      }
      data[matchType] = data1;
    }
    if (t == 0) {
      careerdata[i]["battingCareer"] = data;
    } else {
      careerdata[i]["bowlingCareer"] = data;
    }
  }

  browser.close();
  playerAdded += 1;
  if (playerAdded == totalPlayers) {
    fs.writeFileSync("career.json", JSON.stringify(careerdata));
  }
}

async function main() {
  await browser.get(`https://www.cricbuzz.com/live-cricket-scores/${matchId}`);
  await browser.wait(wd.until.elementLocated(wd.By.css(".cb-nav-bar a")));
  let buttons = await browser.findElements(wd.By.css(".cb-nav-bar a"));
  await buttons[1].click();
  await browser.wait(
    wd.until.elementLocated(
      wd.By.css(`#innings_${innings} .cb-col.cb-col-100.cb-ltst-wgt-hdr`)
    )
  );
  let tables = await browser.findElements(
    wd.By.css(`#innings_${innings} .cb-col.cb-col-100.cb-ltst-wgt-hdr`)
  );
  // console.log(tables.length);
  let inningsBatsmenRows = await tables[0].findElements(
    wd.By.css(".cb-col.cb-col-100.cb-scrd-itms")
  );
  for (let i = 0; i < inningsBatsmenRows.length; i++) {
    let columns = await inningsBatsmenRows[i].findElements(wd.By.css("div"));
    if (columns.length == 7) {
      let url = await columns[0]
        .findElement(wd.By.css("a"))
        .getAttribute("href");
      let playerName = await columns[0].getAttribute("innerText");
      careerdata.push({ playername: playerName });
      inningsBatsmen.push(url);
    }
  }
  let inningsBowlerRows = await tables[1].findElements(
    wd.By.css(".cb-col.cb-col-100.cb-scrd-itms")
  );
  for (let i = 0; i < inningsBowlerRows.length; i++) {
    let columns = await inningsBowlerRows[i].findElements(wd.By.css("div"));
    if (columns.length == 8) {
      let url = await columns[0]
        .findElement(wd.By.css("a"))
        .getAttribute("href");
      let playerName = await columns[0].getAttribute("innerText");
      careerdata.push({ playername: playerName });
      inningsBowler.push(url);
    }
  }

  let finalUrls = inningsBatsmen.concat(inningsBowler);
  for (let i in finalUrls) {
    getCareerData(finalUrls[i], i, finalUrls.length);
  }

  browser.close();
}

main();
