const cheerio = require("cheerio")
const puppeteer = require("puppeteer")

var inArray = require("./data.json")

const newsHeadlines = []
search = async items => {
  for (let i = 0; i < 5; i++) {
    const url =
      "https://www.mos-gorsud.ru/fastsearch?q=3%D0%B0-" +
      items[i] +
      "/2019&page=1"
    // console.log(url)

    const browser1 = await puppeteer
      .launch()
      .then(browser => browser.newPage())
      .then(page => {
        return page.goto(url).then(function() {
          return page.content()
        })
      })

      .catch(console.error)
    const $ = cheerio.load(browser1)

    $(".megasearch-result-item-text").each(function() {
      newsHeadlines.push({
        first: $(this)
          .text()
          .substring(24, 36),
        second: $(this)
          .text()
          .substring(38, 50)
      })
    })
  }
}
