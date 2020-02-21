const puppeteer = require("puppeteer")
const cheerio = require("cheerio")
var js2xmlparser = require("js2xmlparser")

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < 3; index++) {
    await callback(array[index], index, array)
  }
}

const start = async () => {
  inArray = require("./data.json")
  const findArray = []
  await asyncForEach(inArray, async num => {
    try {
      const browser = await puppeteer.launch()
      const page = await browser.newPage()

      await page.goto(
        `https://www.mos-gorsud.ru/search?formType=shortForm&courtAlias=&uid=&instance=&processType=&letterNumber=&caseNumber=3%D0%B0-${num}%2F2019&participant=`,
        { waitUntil: "load", timeout: 0 }
      )
      await page.waitForSelector(".wrapper-search-tables")

      const body = await page.evaluate(() => {
        return document.querySelector("body").innerHTML
      })

      const $ = cheerio.load(body)

      $("tbody tr td div nobr").each(function() {
        const detailsLink = $(this)
          .find(".detailsLink")
          .text()
        const nobr = $(this)
          .next("nobr")
          .text()
        const searchNobr = `3а-${num}/2019`
        if (nobr || detailsLink == searchNobr) {
          findArray.push({
            searchNumber2019: num,
            detailsLink: detailsLink,
            nobr: nobr
          })
        }
      })

      // $(".detailsLink").each(function() {
      //   findArray.push({
      //     id: num,
      //     detailsLink: $(this).text(),
      //     nobr: $(this)
      //       .find("nobr")
      //       .text()
      //   })
      // })

      await browser.close()
      console.log("Done", num)
    } catch (error) {
      console.log("Error", num)
      findArray.push({
        beforeSpan: num,
        span: num,
        error: true
      })
    }
  })

  // console.log("Done", findArray)

  const seen = new Set()

  const resultArray = findArray.filter(el => {
    const duplicate = seen.has(el.searchNumber2019)
    seen.add(el.searchNumber2019)
    return !duplicate
  })

  console.log(resultArray)

  // Save to xlsx
  if (typeof XLSX == "undefined") XLSX = require("xlsx")

  /* make the worksheet */
  var ws = XLSX.utils.json_to_sheet(resultArray)

  /* add to workbook */
  var wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "SUD")

  /* generate an XLSX file */
  XLSX.writeFile(wb, "sheetjs-2.xlsx")

  console.log(js2xmlparser.parse("info", resultArray))

  process.exit(1)
}
start()
