const puppeteer = require("puppeteer")
const cheerio = require("cheerio")

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < 1; index++) {
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
        findArray.push({
          searchNumber2019: num,
          detailsLink: $(this)
            .find(".detailsLink")
            .text(),
          nobr: $(this)
            .next("nobr")
            .text()
        })
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

  console.log("Done", findArray)
  return findArray
}
start()
