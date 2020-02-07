/* external references:
 - https://rawgit.com/SheetJS/js-xlsx/master/dist/xlsx.full.min.js
*/
/* original data */
var data = [
  { first: "3а-1663/2020", second: "3а-6213/2019" },
  { first: "3а-4420/2019", second: " Ма-4712/201" },
  { first: "3а-4421/2019", second: " Ма-4551/201" },
  { first: "3а-1015/2020", second: "3а-5420/2019" },
  { first: "3а-6420/2019", second: " Ма-6807/201" },
  { first: "3а-1015/2020", second: "3а-5420/2019" }
]
// var data = [
//   { name: "John", city: "Seattle" },
//   { name: "Mike", city: "Los Angeles" },
//   { name: "Zach", city: "New York" }
// ]

/* this line is only needed if you are not adding a script tag reference */
if (typeof XLSX == "undefined") XLSX = require("xlsx")

/* make the worksheet */
var ws = XLSX.utils.json_to_sheet(data)

/* add to workbook */
var wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws, "People")

/* generate an XLSX file */
XLSX.writeFile(wb, "sheetjs.xlsx")
