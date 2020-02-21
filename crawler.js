const puppeteer = require("puppeteer")
const cheerio = require("cheerio")

//Всего 15 дел на одной странице поиска
var caseOnPageHeader = []
var caseOnPageDescription = []
var caseOnPageHref = []
var caseOnPage = []
var liOnPage = 0

const start = async i => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto(
    `https://www.mos-gorsud.ru/mgs/search?caseNumber=&letterNumber=&courtAlias=mgs&instance=&participant=%D0%93%D0%91%D0%A3+%22%D0%A6%D0%B5%D0%BD%D1%82%D1%80+%D0%B8%D0%BC%D1%83%D1%89%D0%B5%D1%81%D1%82%D0%B2%D0%B5%D0%BD%D0%BD%D1%8B%D1%85+%D0%BF%D0%BB%D0%B0%D1%82%D0%B5%D0%B6%D0%B5%D0%B9+%D0%B8+%D0%B6%D0%B8%D0%BB%D0%B8%D1%89%D0%BD%D0%BE%D0%B3%D0%BE+%D1%81%D1%82%D1%80%D0%B0%D1%85%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F%22%2C+%D0%94%D0%B5%D0%BF%D0%B0%D1%80%D1%82%D0%B0%D0%BC%D0%B5%D0%BD%D1%82+%D0%B3%D0%BE%D1%80%D0%BE%D0%B4%D1%81%D0%BA%D0%BE%D0%B3%D0%BE+%D0%B8%D0%BC%D1%83%D1%89%D0%B5%D1%81%D1%82%D0%B2%D0%B0+%D0%B3.%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D1%8B&processType=&uid=&page=${i}`,
    { waitUntil: "load", timeout: 0 }
  )
  await page.waitForSelector("th")

  const body = await page.evaluate(() => {
    return document.querySelector("body").innerHTML
  })

  await browser.close()

  return body
}

const counter = async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto(
    `https://www.mos-gorsud.ru/mgs/search?caseNumber=&letterNumber=&courtAlias=mgs&instance=&participant=%D0%93%D0%91%D0%A3+%22%D0%A6%D0%B5%D0%BD%D1%82%D1%80+%D0%B8%D0%BC%D1%83%D1%89%D0%B5%D1%81%D1%82%D0%B2%D0%B5%D0%BD%D0%BD%D1%8B%D1%85+%D0%BF%D0%BB%D0%B0%D1%82%D0%B5%D0%B6%D0%B5%D0%B9+%D0%B8+%D0%B6%D0%B8%D0%BB%D0%B8%D1%89%D0%BD%D0%BE%D0%B3%D0%BE+%D1%81%D1%82%D1%80%D0%B0%D1%85%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F%22%2C+%D0%94%D0%B5%D0%BF%D0%B0%D1%80%D1%82%D0%B0%D0%BC%D0%B5%D0%BD%D1%82+%D0%B3%D0%BE%D1%80%D0%BE%D0%B4%D1%81%D0%BA%D0%BE%D0%B3%D0%BE+%D0%B8%D0%BC%D1%83%D1%89%D0%B5%D1%81%D1%82%D0%B2%D0%B0+%D0%B3.%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D1%8B&processType=&uid=`,
    { waitUntil: "load", timeout: 0 }
  )
  await page.waitForSelector("th")

  const body = await page.evaluate(() => {
    return document.querySelector("body").innerHTML
  })

  await browser.close()

  const $ = cheerio.load(body)
  const maxUrls = $("#paginationFormMaxPages").attr("value")
  return maxUrls
}

counter().then(allPageCount => {
  for (currentPage = 1; currentPage <= allPageCount; currentPage++) {
    start(currentPage)
      .then(body => {
        const $ = cheerio.load(body)
        liOnPage = 0
        caseOnPageHref = []
        caseOnPageDescription = []
        $(".wrapper-search-tables > .custom_table > thead > tr > th").each(
          function() {
            const header = $(this)
              .text()
              .trim()
            caseOnPageHeader.push(header)
          }
        )
        $(".wrapper-search-tables > .custom_table > tbody > tr").each(
          function() {
            const description = $(this)
              .find("td")
              .first()
              .text()
              .trim()
            const href =
              "https://www.mos-gorsud.ru" +
              $(this)
                .find(".detailsLink")
                .attr("href")
                .split("?")[0]

            caseOnPageHref.push(href)
            caseOnPageDescription.push(description)
            liOnPage++
          }
        )

        for (i = 0; i < liOnPage; i++) {
          // Проверка на наличие в строке старого номера дела
          try {
            var oldNumber = caseOnPageDescription[i]
              .match(/\(.*\)/)[0]
              .replace("(", "")
              .replace(")", "")
          } catch (error) {
            var oldNumber = null
          }
          caseOnPage.push({
            caseNumber: caseOnPageDescription[i]
              .replace(/\s+/g, "")
              .split("∼")[0]
              .split("(")[0],
            oldNumber: oldNumber,
            caseMaterials: caseOnPageDescription[i]
              .replace(/\s+/g, "")
              .split("∼")[1],
            href: caseOnPageHref[i]
          })
        }
      })
      .then(fn => {
        //Сохранение в excel
        if (typeof XLSX == "undefined") XLSX = require("xlsx")

        /* make the worksheet */
        var ws = XLSX.utils.json_to_sheet(caseOnPage)

        /* add to workbook */
        var wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "SUD")

        /* generate an XLSX file */
        XLSX.writeFile(wb, "parser.xlsx")

        // //Сохранение в json
        var fs = require("fs")
        let data = JSON.stringify(caseOnPage)
        fs.writeFileSync("data.json", data)
      })
  }
})
