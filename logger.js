const { createLogger, format, transports, info } = require('winston');

const logger = createLogger({
    level: info,
    format: format.json(
        format.timestamp(),
        format.prettyPrint(),
    ),
    transports: [
        new transports.File({ filename: 'combined.log' }),
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.Console({}),
    ],
});


if(process.env.NODE_ENV !== 'production'){
    logger.add(new transports.Console({ format: format.simple() }));
}

module.exports = logger;