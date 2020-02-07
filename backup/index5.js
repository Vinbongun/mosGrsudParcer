const puppeteer = require("puppeteer")
const cheerio = require("cheerio")

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < 2; index++) {
    await callback(array[index], index, array)
  }
}
const newsHeadlines = []
const start = async () => {
  inArray = require("./data.json")
  await asyncForEach(inArray, async num => {
    try {
      const browser = await puppeteer.launch()
      const page = await browser.newPage()
      await page.goto(
        `https://www.mos-gorsud.ru/fastsearch?q=3%D0%B0-${num}/2019&page=1`,
        { waitUntil: "load", timeout: 0 }
      )
      await page.waitForSelector(".megasearch-result-item-linktext", {
        timeout: 1000
      })

      const body = await page.evaluate(() => {
        return document.querySelector("body").innerHTML
      })
      // console.log(body)
      const $ = cheerio.load(body)

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
  })
  console.log("Done", newsHeadlines)
  // Save to xlsx
  if (typeof XLSX == "undefined") XLSX = require("xlsx")

  /* make the worksheet */
  var ws = XLSX.utils.json_to_sheet(newsHeadlines)

  /* add to workbook */
  var wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "SUD")

  /* generate an XLSX file */
  XLSX.writeFile(wb, "sheetjs.xlsx")
}

start()
