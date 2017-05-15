const ipserver = "34.252.130.197"

module.exports = {
  port: process.env.PORT || 3000,
  db: process.env.MONGODB || `mongodb://${ipserver}:27017/planizator`,
  SECRET_TOKEN: 'miclavedetokens'
}
