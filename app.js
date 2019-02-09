var realtime = null
var updateInterval = (5 * 60 * 1000)
const setIntervalAsync = (fn, ms) => {
  return fn().then(() => {
    timeout = setTimeout(() => setIntervalAsync(fn, ms), ms)
  return timeout
  })
}

document.getElementById("toggle").addEventListener("change", onSwitchChange)
async function onSwitchChange(){
  if(this.checked) {
    if (realtime !== null) return 
    realtime = await setIntervalAsync(() => dashboard(),updateInterval)
  } else {
    clearTimeout(timeout)
    timeout = null
    realtime = null
  }
}

//fetch Data
const fetchData = (action) => {
  const apiKey = "5XKQA6GX56G7IZUUTEZ88X916BQNI8J2EX"
  const url=`https://api.etherscan.io/api?${action}&apikey=${apiKey}`
  return fetch(url)
}

// convert response to json
const  parseJson = async (Resp) => {
  if (Resp.ok) {
    let jsonResult = await Resp.json()
    if (Resp.url === marketCapUrl) {return jsonResult.RAW.ETH.USD} else {return jsonResult.result}
  }
  throw new Error('Api did not respond')
}

// get block information by number
const getBlockByNumber = (hexnumber) => {
  return `module=proxy&action=eth_getBlockByNumber&tag=${hexnumber}&boolean=true`
}

var marketCapUrl = "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD"
const  dashboard = async () => {
  const nBlockInfo = async (number) => {
    const nBlock = "0x"+ parseInt(lastBlockInfo.number - number).toString(16)
    const info = await fetchData(getBlockByNumber(nBlock)).then(Resp => parseJson(Resp))
    return info
  }
  
  const byNumber = (firstNum) => {
    if (firstNum === true) {
      return 5000
    } else {
      return Math.round((12 * 60 * 60) / avgBlockTime1) 
    }
  }
  
  // set veriables for calculations
  const getMarketCap = await fetch(marketCapUrl).then(Resp => parseJson(Resp))
  const getPrice = await fetchData("module=stats&action=ethprice").then(Resp => parseJson(Resp))
  const lastBlockInfo = await fetchData(getBlockByNumber("latest")).then(Resp => parseJson(Resp))
  const nBlock1 = await nBlockInfo(byNumber(true))
  const avgBlockTime1 = String((lastBlockInfo.timestamp - nBlock1.timestamp) / byNumber(true)).substr(0, 4)
  const nBlock2 = await nBlockInfo(byNumber(false))
  const avgBlockTime2 = (lastBlockInfo.timestamp - nBlock2.timestamp) / byNumber(false)
  const avghashRate = lastBlockInfo.difficulty / avgBlockTime2.toFixed(1)
  
  // get to html elements and place in array
  let marketCap = document.getElementById("marketcap")
  let price = document.getElementById("price")
  let lastBlock = document.getElementById("lastblockno")
  let Transactions = document.getElementById("transactionsno")
  let hashRate = document.getElementById("avghashrate")
  let difficulty = document.getElementById("avgdifficulty")
  let domArray = [marketCap,price,lastBlock,Transactions,hashRate,difficulty] 
  
  // clear text if exits
  for (let e of domArray) {
    if (e.innerHTML != "") {
      e.innerHTMLS = ""
    }
  }
  
  // add to html
  marketCap.innerHTML = `${(getMarketCap.MKTCAP / 1e9).toFixed(3)} BILLION`
  price.innerHTML = `${getPrice.ethusd} @ ${getPrice.ethbtc}`
  lastBlock.innerHTML = Number(lastBlockInfo.number)
  Transactions.innerHTML = Number(lastBlockInfo.transactions.length)
  hashRate.innerHTML = `${(avghashRate / 1e9).toFixed(2)} GH/s` 
  difficulty.innerHTML = `${(lastBlockInfo.difficulty / 1e12).toFixed(2)} TH` 
}

dashboard()