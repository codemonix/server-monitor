import logger from "../utils/logger.js";


export default function errorHandler( error, req, res, next ) {
    logger.error(error);
    res.status(500).json({ message: error.message || 'internal server error'})
}