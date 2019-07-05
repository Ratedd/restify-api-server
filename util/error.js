const errors = require('restify-errors');

const error = {
	internalServerError: () => new errors.InternalError({ restCode: 500 }, 'Internal Server Error'),
	fieldError: () => new errors.MethodNotAllowedError({ restCode: 405 }, 'One or more field(s) is/are missing'),
	alreadyRegisteredError: () => new errors.BadRequestError({ restCode: 400 }, 'Already Registered')
};

module.exports = error;
