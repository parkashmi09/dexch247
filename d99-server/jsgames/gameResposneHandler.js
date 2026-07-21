const GameResponseHandler = {
    ERROR_CODES: {
        0: 'Success',
        10002: 'Agency not found',
        10004: 'Payload processing error',
        10005: 'System error',
        10008: 'Game not found',
        10011: 'Player currency mismatch',
        10012: 'Player name already exists',
        10013: 'Unsupported currency',
        10014: 'Invalid player name',
        10015: 'Player account must use a-z and 0-9',
        10017: 'Game manufacturer does not exist',
        10018: 'Currency not supported for this game',
        10019: 'Account frozen. Please contact administrator',
        10020: 'No currency configured',
        10022: 'Incorrect parameters',
        10023: 'Player name must be at least 3 characters',
        10024: 'Wallet mode mismatch',
        10025: 'Insufficient wallet balance',
        10026: 'Transfer failed',
        10027: 'Transfer order already exists',
        10028: 'Start and end dates are required',
        10029: 'Start and end dates must be the same day',
        10030: 'Too many requests. Please try again later',
        10031: 'Can only query data from last 60 days',
        10032: 'End date must be after start date',
        10033: 'Invalid home URL',
        10034: 'System under maintenance'
    },

    handleSuccessResponse(originalResponse, customPayload = {}) {
        return {
            success: true,
            code: 0,
            message: this.ERROR_CODES[0],
            payload: {
                ...originalResponse.payload,
                ...customPayload
            }
        };
    },

    handleErrorResponse(errorCode, customMessage = null) {
        const defaultMessage = this.ERROR_CODES[errorCode] || 'Unknown error';
        
        return {
            success: false,
            code: errorCode,
            message: customMessage || defaultMessage
        };
    },

    processGameServerResponse(apiResponse) {
        try {
            if (apiResponse.code === 0) {
                return this.handleSuccessResponse(apiResponse);
            }

            return this.handleErrorResponse(apiResponse.code, apiResponse.msg);
        } catch (error) {
            console.error('Response processing error:', error);
            return this.handleErrorResponse(10005);
        }
    },

    logErrorDetails(context, error, additionalInfo = {}) {
        console.error(`Error in ${context}:`, {
            message: error.message,
            stack: error.stack,
            ...additionalInfo
        });
    }
};

export default GameResponseHandler;