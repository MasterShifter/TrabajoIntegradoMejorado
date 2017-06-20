//DB ipserver, use 34.252.130.197 for the amazon machine
const ipserver = "localhost"

//use PORT 3000 to avoid conflicts with the port 80
module.exports = {
  port: process.env.PORT || 80,
  db: process.env.MONGODB || `mongodb://${ipserver}:27017/planizator`,
  SECRET_TOKEN: 'miclavedetokens'
}
