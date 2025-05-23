import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { decrypt } from "../config/aesHashToken";
import { NotAuthorizedError } from "../errors/not-authorized-error";
import { TokenExpiredUnauthorizedError } from "../errors/token-expired-authorized-error";
import { BROWSER_SIGN_DELIMETER, NODE_ENV } from "../config/envConfig";


const regexDate = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]|(?:JAN|MAR|MAY|JUL|AUG|OCT|DEC)))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2]|(?:JAN|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)(?:0?2|(?:Feb))\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9]|(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP))|(?:1[0-2]|(?:OCT|NOV|DEC)))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})/;




export const currentUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let { authorization, clientcode, accyear, quater, month, frommonth, tomonth, tdscode, modulecode }: any = req.headers;
    if (NODE_ENV == "PROD") {
        clientcode = atob(clientcode);
        accyear = atob(accyear);
        quater = atob(quater);
        month = atob(month);
        frommonth && (frommonth = atob(frommonth));
        tomonth && (tomonth = atob(tomonth));
        tdscode = atob(tdscode);
        modulecode = atob(modulecode);
    }

    if (!(/[A-Za-z0-9 \-]{1,6}/.test(clientcode))) throw new NotAuthorizedError("Invalid Headers", 403);
    if (!(/[0-9\-]{5}/.test(accyear))) throw new NotAuthorizedError("Invalid Headers", 403);
    if (!(/[0-9]{1}/.test(quater))) throw new NotAuthorizedError("Invalid Headers", 403);
    if (month && !(/(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)/.test(month))) throw new NotAuthorizedError("Invalid Headers", 403);
    if (frommonth && !(regexDate.test(frommonth))) throw new NotAuthorizedError("Invalid Headers", 403);
    if (tomonth && !(regexDate.test(tomonth))) throw new NotAuthorizedError("Invalid Headers", 403);
    if (!(/[A-Za-z0-9 \-]{0,12}/.test(modulecode))) throw new NotAuthorizedError("Invalid Headers", 403);

    if (!authorization) {
        return next();
    }
    if (new Set([clientcode, accyear, quater, month, tdscode, modulecode]).has(undefined || "")) {
        return next();
    }
    if (!BROWSER_SIGN_DELIMETER) throw new NotAuthorizedError("TokenNotMatched", 403);
    let token: any = req.headers.authorization;
    token = await decrypt(token?.split(BROWSER_SIGN_DELIMETER)[0]);

    jwt.verify(token, `${process.env.ACCESS_TOKEN_SECRET}`, (err: any, payload: any): any => {
        if (err) {
            if (err.name === "TokenExpiredError" && err.message === "jwt expired") {
                throw new TokenExpiredUnauthorizedError(err.name, err.message);
            } else {
                throw new NotAuthorizedError("TokenNotMatched", 403);
            }
        } else {
            if (payload.agentUser != token?.split(BROWSER_SIGN_DELIMETER)[1]) throw new NotAuthorizedError("TokenNotMatched", 403);
            req.currentUser = { ...payload, client_code: clientcode, default_acc_year: accyear, default_quarter_no: quater, default_tran_month: month, default_from_date: frommonth, default_to_date: tomonth, default_tds_type_code: tdscode, default_module_type_code: modulecode };
        }
    });
    // req.body = await payloadDecrypter(req.body);
    next();
}