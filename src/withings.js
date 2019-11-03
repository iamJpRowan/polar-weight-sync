const fetch = require('node-fetch')
const dotenv = require('dotenv')

dotenv.config()

exports.getWeight = async (event) => {
  console.log('Getting weight from withings.')

  //TODO: Implement retrieving tokens from Mongo and refreshing before sending post to update.

  const res = await fetch("https://wbsapi.withings.net/measure" +
    `?action=getmeas&meastype=1&startdate=${event.startDate}&enddate=${event.endDate}`, {
    headers: {Authorization: `Bearer 439d3b1f3b77fee4da6c73272a4dd1af1ee70175`}
  })

  const response = await res.json()
  const measurement = response.body.measuregrps[0].measures[0]
  const grams = measurement.value
  const weight = Math.round((grams/453.592) * 100) / 100

  console.log(weight)
  return weight
}
