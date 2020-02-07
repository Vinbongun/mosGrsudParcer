const puppeteer = require("puppeteer")
const cheerio = require("cheerio")

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < 3; index++) {
    await callback(array[index], index, array)
  }
}

const start = async () => {
  inArray = require("./data.json")
  const newsHeadlines = []
  await asyncForEach(inArray, async num => {
    try {
      const browser = await puppeteer.launch()
      const page = await browser.newPage()

      await page.goto(
        `https://www.mos-gorsud.ru/fastsearch?q=3%D0%B0-${num}/2019&page=1`,
        { waitUntil: "load", timeout: 0 }
      )
      await page.waitForSelector(
        ".megasearch-result-item-text"
        // , {
        //   timeout: 6000
        // }
      )

      const body = await page.evaluate(() => {
        return document.querySelector("body").innerHTML
      })
      // console.log(body)
      const $ = cheerio.load(body)

      $(".megasearch-result-item-text span").each(function() {
        newsHeadlines.push({
          span: $(this)
            .eq(0)
            .text()
        })
      })

      $(".megasearch-result-item-text").each(function() {
        const beforeSpan = $(this)
          .first()
          .contents()
          .eq(0)
          .text()
          .split(":")[1]
          .split("(")[0]
          .trim()
        if (beforeSpan !== "") {
          newsHeadlines.push({
            beforeSpan: beforeSpan
          })
        } else {
          newsHeadlines.push({
            beforeSpan: null
          })
        }
      })

      // $(".megasearch-result-item-text.firstChild").each(function() {
      //   newsHeadlines.push({
      //     AfterSpan: $(this)
      //       .first()
      //       .contents()
      //       .eq(0)
      //       .text()
      //       .split(":")[1]
      //       .split("(")[0]
      //   })
      // })

      // $(".megasearch-result-item-text").each(function() {
      //   newsHeadlines.push({
      //     AfterSpan: $(this)
      //       .first()
      //       .contents()
      //       .eq(0)
      //       .text()
      //   })
      // })

      await browser.close()
    } catch (error) {
      console.log(error)
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
  XLSX.writeFile(wb, "sheetjs.xlsx")
  process.exit(1)
}

start()
