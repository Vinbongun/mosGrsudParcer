const puppeteer = require("puppeteer")
const cheerio = require("cheerio")

;(async () => {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(
      "https://www.mos-gorsud.ru/fastsearch?q=3%D0%B0-2022/2019&page=1"
    )
    await page.waitForSelector(".megasearch-result-item-linktext", {
      timeout: 1000
    })

    const body = await page.evaluate(() => {
      return document.querySelector("body").innerHTML
    })
    // console.log(body)
    const $ = cheerio.load(body)
    const newsHeadlines = []
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
    console.log(newsHeadlines)

    await browser.close()
  } catch (error) {
    console.log(error)
  }
})()
