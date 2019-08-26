const nodeFetch = require('node-fetch')
const fetch = require('fetch-cookie')(nodeFetch)
const { URLSearchParams } = require('url')
const jsdom = require("jsdom")
const dotenv = require('dotenv')

dotenv.config()

const getDocument = async (html) => {
  const { document } = await new jsdom.JSDOM(html).window
  return document
}


const login = async () => {
  console.log("Logging in.")

  const postParams = new URLSearchParams()
  postParams.append('email', process.env.POLAR_USER_EMAIL)
  postParams.append('password', process.env.POLAR_USER_PASSWORD)

  const response = await fetch("https://flow.polar.com/login", {
    method: "POST",
    credentials: "same-origin",
    redirect: "manual",
    body: postParams,
  })
  console.log(response.status)

  return
}


const getCurrentDataForDate = async (date) => {
  console.log(`Getting data for ${date}.`)

  const response = await fetch("https://flow.polar.com/training/day/" + date, {
    credentials: "same-origin",
  })
  console.log(response.status)

  const html = await response.text()
  const document = await getDocument(html)

  const data = {
    userId: document.getElementsByName('userId')[0].value,
    date: document.getElementsByName('date')[0].value,
    note: document.getElementById("note").value,
    weight: document.getElementById("weight").value,
    feeling: document.getElementById("feeling").value,
  }
  console.log(
    `UserId: ${data.userId} \n` +
    `note: ${data.note} \n` +
    `weight: ${data.weight} \n` +
    `feeling: ${data.feeling}`
  )
  return data
}


const postNewWeight = async (currentData, weight) => {

  const postParams = new URLSearchParams()
  postParams.append('userId', currentData.userId)
  postParams.append('date', currentData.date)
  postParams.append('note', currentData.note)
  postParams.append('weight', weight)
  postParams.append('feeling', currentData.feeling)

  const response = await fetch("https://flow.polar.com/training/updateDailyData", {
    method: "POST",
    body: postParams,
  })
  console.log(response.status)

  return
}

const run = async (date, weight) => {
  await login()
  const currentData = await getCurrentDataForDate(date)
  await postNewWeight(currentData, weight)
  console.log("Done!")
}

run("2.8.2019", 154.9)
