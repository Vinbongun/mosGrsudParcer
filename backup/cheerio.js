const cheerio = require("cheerio")
const $ = cheerio.load("")

const newsHeadlines = []
$(".megasearch-result-item-text span").each(function() {
  newsHeadlines.push({
    Span: $(this).text()
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
  if (beforeSpan !== " ") {
    newsHeadlines.push({
      beforeSpan: beforeSpan
    })
  } else {
    newsHeadlines.push({
      beforeSpan: null
    })
  }
})

console.log(newsHeadlines)
