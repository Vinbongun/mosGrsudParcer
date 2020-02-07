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

    const browser = await puppeteer
      .launch()
      .then(browser => browser.newPage())
      .then(page => {
        return page.goto(url).then(function() {
          return page.content()
        })
      })
      .then(html => {
        const $ = cheerio.load(html)

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

        // console.log(newsHeadlines)
      })
      .catch(console.error)
  }
  console.log("Готово")

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
