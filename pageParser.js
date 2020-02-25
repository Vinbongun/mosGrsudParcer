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
  const cardsud_wrapperLeft = []
  const cardsud_wrapperRight = []
  const cardsud_wrapper = []
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

  const allDone = { info: cardsud_wrapper, session: session }
  console.log(allDone)

  //   console.log(cardsud_wrapper.concat(session))

  //   //Сохранение в excel
  //   if (typeof XLSX == "undefined") XLSX = require("xlsx")

  //   /* make the worksheet */
  //   var ws = XLSX.utils.json_to_sheet(allDone)

  //   /* add to workbook */
  //   var wb = XLSX.utils.book_new()
  //   XLSX.utils.book_append_sheet(wb, ws, "SUD")

  //   /* generate an XLSX file */
  //   XLSX.writeFile(wb, "parser.xlsx")

  // Сохранение в json
  var fs = require("fs")
  let data = JSON.stringify(allDone)
  fs.writeFileSync("data.json", data)
})
