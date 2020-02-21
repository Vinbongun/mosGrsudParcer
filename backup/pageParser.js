const puppeteer = require("puppeteer")
const cheerio = require("cheerio")

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const start = async () => {
  const cardsud_wrapper = []
  const thead = []
  const descriptionArray = []
  const tabs2 = []

  try {
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

    const $ = cheerio.load(body)
    // const $ = cheerio.load(
    //   '<div id="tabs-2" aria-labelledby="ui-id-2" role="tabpanel" class="ui-tabs-panel ui-corner-bottom ui-widget-content" aria-hidden="false" style="display: block;"><div role="tabpanel" class="tab-pane" id="sessions"><table class="custom_table mainTable"><thead class="hidden-xs"><tr><th>Дата и время</th><th>Зал</th><th>Стадия</th><th>Результат</th><th>Основание</th><th>Проводилась видеозапись</th></tr></thead><tbody><tr><td><div>02.03.2020 10:45</div></td><td><div>604 - Основное здание</div></td><td><div>Беседа</div></td><td><div></div></td><td><div></div></td><td><div></div></td></tr></tbody></table></div></div>'
    // )

    $(".row_card").each(function() {
      const left = $(this)
        .find(".left")
        .text()
        .replace("\n", "")
        .trim()
      const right = $(this)
        .find(".right")
        .text()
        .replace("\n", "")
        .trim()

      cardsud_wrapper.push({
        left,
        right
      })
    })

    $("#tabs-2 > div > table > thead > tr > th").each(function() {
      const header = $(this)
        .text()
        .replace("\n", "")
        .trim()
      thead.push(header)
    })

    $("#tabs-2 > div > table > tbody > tr > td > div").each(function() {
      const description = $(this)
        .text()
        .replace("\n", "")
        .trim()
      descriptionArray.push(description)
    })

    await browser.close()
  } catch (error) {
    console.log("Error")
  }

  // const tabs2 = descriptionArray.reduce(function(tabs2, field, index) {
  //   tabs2[thead[index]] = field
  //   return tabs2
  // }, {})

  // const splits = tabs2["Дата и время"].split(" ")
  // const tabs2Data = splits[0]
  // const tabs2Time = splits[1]

  //удаляет из масива строку с датой и временем заседания
  //   tabs2["Дата и время"].splice(0, 1)

  //добавляет в начало отдельные строки даты и времени заседания
  //   tabs2.unshift("Дата", splits[0])
  //   tabs2.unshift("Время", splits[1])

  // console.log("Карточка", cardsud_wrapper)
  // console.log("Описание", thead)
  // console.log("Строка", descriptionArray)
  await timeout(3000)
  for (const i of descriptionArray) {
    tabs2.push({
      date: descriptionArray[i]
    })
  }
  console.log("tabs2", tabs2)
}

start()
