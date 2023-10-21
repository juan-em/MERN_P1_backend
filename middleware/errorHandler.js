const  { logEvents } = require('./logger')

const errorHandler = (err, req, res, next) => {
    logEvents(`${err.name}\t${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
    console.log(err.stack)

    const status = res.statusCode ? res.statusCode : 500
    res.status(status)
    //the property isError is to provide communication to the frontend apislice
    res.json({message: err.message, isError: true}) 
}

module.exports = { errorHandler }