const { Logger } = require('../lib/logger')

describe('logger', () => {
    it('logs', () => {
        const logger = new Logger({})

        logger.info('info')
        logger.warn('warn')
        logger.error('error', new Error('error'))
    })

    it('logs in debug', () => {
        const logger = new Logger({debug: true})

        logger.info('info')
        logger.warn('warn')
        logger.error('error', new Error('error'))
    })
})
