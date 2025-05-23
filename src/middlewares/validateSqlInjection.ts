import { Request, Response, NextFunction } from 'express';
function validateSqlInjection(req: Request, res: Response, next: NextFunction) {
  // Check if req.body exists and is an object
  if (req.body && typeof req.body === 'object') {
    // Loop through all the properties in req.body
    for (const key in req.body) {
      if (req.body.hasOwnProperty(key)) {
        const value = req.body[key];
        // Check for potential SQL injection
        if (hasSqlInjection(value)) {
          // SQL injection detected
          return res.status(400).send({
            errors: [
              { message: 'Invalid inputes' }
            ]
          })
        }
      }
    }
  }
  // No SQL injection detected, proceed to the next middleware
  next();
}
function hasSqlInjection(value: any): boolean {
  // Regular expression pattern to check for SQL injection characters
  const sqlInjectionRegex = /[';"\\]/;
  // Convert the value to a string
  const stringValue = String(value);
  // Check if the string value contains any SQL injection characters
  return sqlInjectionRegex.test(stringValue);
}
export default validateSqlInjection;