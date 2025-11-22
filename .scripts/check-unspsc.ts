import XLSX from 'xlsx'

async function main() {
  const url = 'https://www.undp.org/sites/g/files/zskgke326/files/2025-03/unspsc-english-v260801.1.xlsx'

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
  })

  const buffer = await response.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(sheet)

  console.log('Total rows:', data.length)

  // Find where the actual data starts
  console.log('\nSearching for data header row...')
  for (let i = 0; i < Math.min(20, data.length); i++) {
    const keys = Object.keys(data[i])
    console.log(`Row ${i + 1} keys:`, keys)
    if (keys.length > 5) {
      console.log(`\nFound header at row ${i + 1}:`)
      console.log(data[i])
      console.log(`\nNext 3 data rows:`)
      data.slice(i + 1, i + 4).forEach((row, idx) => {
        console.log(`\nData row ${idx + 1}:`, row)
      })
      break
    }
  }
}

main()
