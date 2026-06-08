const errorHandler = (err, req, res, next) => {
    console.error(`[Error]: ${err.message}`);

    // If the status code is still 200, force it to 500 (Internal Server Error)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
        success: false,
        error: err.message || 'Internal Server Error',
        // Show the stack trace ONLY if we are in development mode
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = errorHandler;