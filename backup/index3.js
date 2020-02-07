const cheerio = require("cheerio")
const puppeteer = require("puppeteer")

const newsHeadlines = []
inArray = require("./data.json")

const startQue = (async (data, index) => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(
    `https://www.mos-gorsud.ru/fastsearch?q=3%D0%B0-${data[index]}/2019&page=1`
  )
  await page.screenshot({ path: "example.png" })

  await browser.close()
})()

for (i = 0; i < 5; i) {
  startQue(inArray, inArray[i])
}
