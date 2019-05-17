const errors = require('restify-errors');

const error = {
	internalServerError: () => new errors.InternalError({ restCode: 500 }, 'Internal Server Error')
};

module.exports = error;
