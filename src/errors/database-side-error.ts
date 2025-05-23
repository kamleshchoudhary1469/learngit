import { CustomError } from "./custom-error";
import { dbValidationError } from "../common/interface/jwt"

export class DatabaseSideError extends CustomError {
    statusCode = 500

    constructor(public dbErrors: dbValidationError[] | string, statusCode: number = 500) {
        super('Error connection to database', statusCode);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, DatabaseSideError.prototype);
    }

    serializeErrors() {
        return Array.isArray(this.dbErrors) ? this.dbErrors.map(err => {
            return {
                field: err.field, message: err.message,
            }
        }) :
            [
                {
                    message: this.dbErrors ? this.dbErrors : "Error connection to database"
                }
            ];
    }

}