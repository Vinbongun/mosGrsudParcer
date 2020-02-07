const puppeteer = require("puppeteer")
const cheerio = require("cheerio")

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < 3; index++) {
    if (array[index].error !== true) {
      await callback(array[index], index, array)
    } else {
      console.log("Array error")
      await callback(array[index], index, array)
    }
  }
}

const start = async () => {
  inArray = require("./data.json")
  const newsHeadlines = []
  const task = await asyncForEach(inArray, async num => {
    try {
      const browser = await puppeteer.launch()
      const page = await browser.newPage()

      await page.goto(
        `https://www.mos-gorsud.ru/fastsearch?q=3%D0%B0-${num}/2019&page=1`,
        { waitUntil: "load", timeout: 0 }
      )
      await page.waitForSelector(".megasearch-result-item-text")

      const body = await page.evaluate(() => {
        return document.querySelector("body").innerHTML
      })

      const $ = cheerio.load(body)

      $(".megasearch-result-item-text").each(function() {
        const beforeSpan = $(this)
          .first()
          .contents()
          .eq(0)
          .text()
          .split(":")[1]
          .split("(")[0]
          .trim()
        const span = $(this)
          .find("span")
          .text()
        if (beforeSpan) {
          newsHeadlines.push({
            id: num,
            beforeSpan: beforeSpan,
            span: span
          })
        } else {
          newsHeadlines.push({
            id: num,
            beforeSpan: null,
            span: span
          })
        }
        if (span) {
          newsHeadlines.push({
            id: num,
            beforeSpan: beforeSpan,
            span: span
          })
        } else {
          newsHeadlines.push({
            id: num,
            beforeSpan: beforeSpan,
            span: null
          })
        }
      })

      await browser.close()
      console.log("Done", num)
    } catch (error) {
      // console.log(error)
      console.log("Error", num)
      newsHeadlines.push({
        id: num,
        error: true
      })
    }

    return newsHeadlines
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
  XLSX.writeFile(wb, "sheetjs-diblicat.xlsx")
  process.exit(1)
}

start()
