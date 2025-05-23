import { Request, Response, Router } from 'express';
import { validationRequest } from '../middlewares/validate-request';
import { body } from 'express-validator';
import { DatabaseSideError } from '../errors/database-side-error';
import validateSqlInjection from '../middlewares/validateSqlInjection';
const router = Router();

router.post('/ssologin',
    [
        body('userdetails').exists().withMessage('User details is required').trim().notEmpty(),
    ],
    validationRequest, validateSqlInjection,
    async (req: Request, res: Response) => {
        try {

            res.send({});
        } catch (error) {
            console.error(error);
            if (error) {
                if (error.length) {
                    throw new DatabaseSideError(error, 500);
                }
                throw new DatabaseSideError("server side error", 500);
            }
        }
    }
);
export { router as testRouter };