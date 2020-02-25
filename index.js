const puppeteer = require("puppeteer")
const cheerio = require("cheerio")

const start = async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto(
    `https://www.mos-gorsud.ru/mgs/services/cases/first-admin/details/91a57fe4-818a-4a58-8ba5-26032b997c93`,
    { waitUntil: "load", timeout: 0 }
  )
  await page.waitForSelector(".cardsud_wrapper")

  const body = await page.evaluate(() => {
    return document.querySelector("body").innerHTML
  })

  await browser.close()

  return body
}

start().then(body => {
  const cardsud_wrapper = []
  const cardsud_wrapperLeft = []
  const cardsud_wrapperRight = []
  const thead = []
  const descriptionArray = []
  const session = []

  const $ = cheerio.load(body)

  //Карточка судебного дела
  $(".row_card").each(function() {
    const left = $(this)
      .find(".left")
      .text()
      .replace("\n", "")
      .trim()
    const right = $(this)
      .find(".right")
      .text()
      .replace(/\n/g, "")
      .trim()

    cardsud_wrapperLeft.push(left)
    cardsud_wrapperRight.push(right)
  })

  var uniqueIdIndex = cardsud_wrapperLeft.indexOf(
    "Уникальный идентификатор дела"
  )
  var caseNumberIndex = cardsud_wrapperLeft.indexOf("Номер дела ~ материала")
  var partiesIndex = cardsud_wrapperLeft.indexOf("Стороны")
  var dateInIndex = cardsud_wrapperLeft.indexOf("Дата поступления")
  var dateReviewIndex = cardsud_wrapperLeft.indexOf(
    "Дата рассмотрения дела в первой инстанции"
  )
  var dateEntryIndex = cardsud_wrapperLeft.indexOf(
    "Дата вступления решения в силу"
  )
  var judgeIndex = cardsud_wrapperLeft.indexOf("Cудья")
  var categoryIndex = cardsud_wrapperLeft.indexOf("Категория дела")
  var currentStateIndex = cardsud_wrapperLeft.indexOf("Текущее состояние")

  //Проверка на наличие старого номера дела
  try {
    var oldNumber = cardsud_wrapperRight[caseNumberIndex]
      .match(/\(.*\)/)[0]
      .replace("(", "")
      .replace(")", "")
  } catch (error) {
    var oldNumber = null
  }

  cardsud_wrapper.push({
    uniqueId: cardsud_wrapperRight[uniqueIdIndex],
    caseNumber: cardsud_wrapperRight[caseNumberIndex]
      .replace(/\s+/g, "")
      .split("∼")[0]
      .split("(")[0],
    oldNumber: oldNumber,
    caseMaterials: cardsud_wrapperRight[caseNumberIndex]
      .replace(/\s+/g, "")
      .split("∼")[1],
    plaintiff: cardsud_wrapperRight[partiesIndex]
      .replace("Административный истец: ", "")
      .split("Административный ответчик: ")[0]
      .trim(),
    defendant: cardsud_wrapperRight[partiesIndex]
      .split("Административный ответчик:")[1]
      .trim(),
    dateIn: cardsud_wrapperRight[dateInIndex],
    dateReview: cardsud_wrapperRight[dateReviewIndex],
    dateEntry: cardsud_wrapperRight[dateEntryIndex],
    judge: cardsud_wrapperRight[judgeIndex],
    category: cardsud_wrapperRight[categoryIndex],
    currentState: cardsud_wrapperRight[currentStateIndex]
  })

  //Заголовок таблицы судебного заседания
  $("#tabs-2 > div > table > thead > tr > th").each(function() {
    const header = $(this)
      .text()
      .replace("\n", "")
      .trim()
    thead.push(header)
  })

  //Строки таблицы судебного заседания
  $("#tabs-2 > div > table > tbody > tr").each(function() {
    $(this)
      .find("td > div")
      .each(function() {
        const description = $(this)
          .text()
          .replace(/\n/g, "")
          .trim()
        descriptionArray.push(description)
      })
  })

  var tableDateIndex = thead.indexOf("Дата и время")
  var tableRoomIndex = thead.indexOf("Зал")
  var tableStageIndex = thead.indexOf("Стадия")
  var tableResultIndex = thead.indexOf("Результат")
  var tableBasisIndex = thead.indexOf("Основание")

  for (var i = 0; i < descriptionArray.length / 6; i++) {
    session.push({
      id: i + 1,
      date: descriptionArray[tableDateIndex].split(" ")[0],
      time: descriptionArray[tableDateIndex].split(" ")[1],
      room: descriptionArray[tableRoomIndex],
      stage: descriptionArray[tableStageIndex],
      results: descriptionArray[tableResultIndex],
      basis: descriptionArray[tableBasisIndex]
    })

    tableDateIndex += 6
    tableRoomIndex += 6
    tableStageIndex += 6
    tableResultIndex += 6
    tableBasisIndex += 6
  }

  // console.log(cardsud_wrapper.concat(session))

  const allDone = []

  allDone.push.apply({ info: { cardsud_wrapper }, session: session })

  console.log(allDone)

  // //Сохранение в excel
  // if (typeof XLSX == "undefined") XLSX = require("xlsx")

  // /* make the worksheet */
  // var ws = XLSX.utils.json_to_sheet(cardsud_wrapper.concat(session))

  // /* add to workbook */
  // var wb = XLSX.utils.book_new()
  // XLSX.utils.book_append_sheet(wb, ws, "SUD")

  // /* generate an XLSX file */
  // XLSX.writeFile(wb, "parser.xlsx")

  // //Сохранение в json
  // var fs = require("fs")
  // let data = JSON.stringify(cardsud_wrapper.concat(session))
  // fs.writeFileSync("data.json", data)
})

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
            var oldNumber = ""
          }
          caseOnPage.push({
            // caseNumber: caseOnPageDescription[i]
            //   .replace(/\s+/g, "")
            //   .split("∼")[0]
            //   .split("(")[0],
            // oldNumber: oldNumber,
            // caseMaterials: caseOnPageDescription[i]
            //   .replace(/\s+/g, "")
            //   .split("∼")[1],
            href: caseOnPageHref[i]
          })
        }
        console.log(caseOnPage)
      })
      .then(fn => {
        //Сохранение в excel
        if (typeof XLSX == "undefined") XLSX = require("xlsx")

        /* создания листа */
        var ws = XLSX.utils.json_to_sheet(caseOnPage)

        /* добавление в книгу */
        var wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "SUD")

        /* генерация и сохранение файла */
        XLSX.writeFile(wb, "data/parser.xlsx")

        // //Сохранение в json
        var fs = require("fs")
        let data = JSON.stringify(caseOnPage)
        fs.writeFileSync("data/data.json", data)
      })
  }
})
