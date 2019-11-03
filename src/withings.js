const fetch = require('node-fetch')
const { URLSearchParams } = require('url')
const dotenv = require('dotenv')
const AWS = require('aws-sdk')

dotenv.config()

AWS.config.update({ region: 'us-west-2' })
const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' })

const getNewTokens = async (refreshToken) => {

  const postParams = new URLSearchParams()
  postParams.append('grant_type', 'refresh_token')
  postParams.append('client_id', process.env.WITHINGS_CLIENT_ID)
  postParams.append('client_secret', process.env.WITHINGS_CLIENT_SECRET)
  postParams.append('refresh_token', refreshToken)
  postParams.append('redirect_uri', 'https://sync.jprowan.com/withings/callback')

  const response = await fetch("https://account.withings.com/oauth2/token", {
    method: "POST",
    body: postParams
  })
  console.log(response.status)

  const data = await response.json()
  console.log(data)

  const tokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  }

  return tokens
}

const getLastRefreshToken = async (userId) => {

  const response = await ddb.get({
    TableName: 'WithingsTokens',
    Key: {
      UserId: userId,
    },
  }).promise()

  return response.Item.RefreshToken
}

const storeRefreshToken = async (userId, refreshToken) => {

  const response = await ddb.put({
    TableName: 'WithingsTokens',
    Item: {
      UserId: userId,
      RefreshToken: refreshToken,
    }
  }).promise()

  return response
}

exports.getWeight = async (event) => {
  console.log('Getting weight from withings.')

  const lastRefreshToken = await getLastRefreshToken(event.userId)
  const newTokens = await getNewTokens(lastRefreshToken)

  storeRefreshToken(event.userId, newTokens.refreshToken)


  const res = await fetch("https://wbsapi.withings.net/measure" +
    `?action=getmeas&meastype=1&startdate=${event.startDate}&enddate=${event.endDate}`, {
    headers: {Authorization: `Bearer ${newTokens.accessToken}`}
  })

  const response = await res.json()
  const measurement = response.body.measuregrps[0].measures[0]
  const grams = measurement.value
  const weight = Math.round((grams/453.592) * 100) / 100

  return weight

}
