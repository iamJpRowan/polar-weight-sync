const polar = require('./polar')
const withings = require('./withings')

exports.handler = async (event) => {
  console.log(`Receiving new event:`)
  const queryParams = event.body.split('&')

  var params = {};
  queryParams.forEach(function (pair) {
    pair = pair.split('=');
    params[pair[0]] = decodeURIComponent(pair[1] || '');
  });

  console.log(params)

  const weight = await withings.getWeight({
    userId: params.userid,
    startDate: params.startdate,
    endDate: params.enddate
  })

  const date = new Date(params.startdate * 1000)

  await polar.postToPolar({
    date: `${date.getDay()}.${date.getMonth()}.${date.getFullYear()}`,
    weight: weight
  })

  const response = {
    statusCode: 202,
  };
  return response;
};

