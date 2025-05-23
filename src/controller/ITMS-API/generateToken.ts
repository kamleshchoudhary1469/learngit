import { NextFunction, Request, Response, Router } from 'express';
import { body } from 'express-validator';
import { JwtAuthData } from '../../common/interface/jwt';
import { generateTokens } from '../../common/secure/token';
import encrypt from '../../config/aesHashToken';
import { execute } from '../../config/db';
import { validationRequest } from '../../middlewares/validate-request';
import sCode from '../../common/status-codes';
import { DatabaseSideError } from '../../errors/database-side-error';
import { checkHashPassword } from '../../common/secure/passwords';
import { DEBUG_DB } from '../../config/envConfig';
import axios from 'axios';
import validateSqlInjection from '../../middlewares/validateSqlInjection';
const { ok, server_error } = sCode;
const router = Router();
const { SSOSERVER_UAT_URL, WSUSERNAME, WSPASSWORD, SECRETKEY, SSO_APPLICATION_NAME } = process.env;
const crypto = require('crypto');

const encryptAES = async (plainText: any, SECRETKEY: any) => {
    const key = SECRETKEY;
    const iv = Buffer.from(key);
    const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

router.post('/generate-token',
    async (req: Request, res: Response, next: NextFunction) => {
        req.headers.homeorigin = "/itms";
        next();
    },
    [
        body('merchant_loginid').exists().withMessage('login id is required').trim().notEmpty(),
        body('merchant_loginpw').exists().withMessage('Password is required').trim().notEmpty()
    ],
    validationRequest,
    validateSqlInjection,
    async (req: Request, res: Response) => {
        const { requestid, merchantid, merchant_loginid, merchant_loginpw, session_seqno, iud_seqno } = req.body;

        const sdata = `{
                    "a_session_seqno": "session_seqno_replace",
                    "a_iud_seqno": "iud_seqno_replace",
                    "a_process_seqno": "",
                    "a_iud_type": "login_id",
                    "a_proc_type": "get_gmdt_login_id",
                    "a_proc_error": "0",
                    "a_process_status_code": "ZA",
                    "a_db_total_records":"1000",
                    "a_pagination_count":"0",
                    "a_in_parameter_json": [
                        {
                            "a_login_id": "${merchant_loginid}",
                            "a_module_type_code":"TAXCPC"
                        }
                    ]
                }`;

        const result: any = await execute(`BEGIN PKG_TAXCPC_APP.PROC_CALL_MAIN_INOUT(session_seqno_replace, iud_seqno_replace, :a_in_parameter_json, :a_out_parameter_json,'ADMIN'); END;`, sdata, 'get_gmdt_login_id', req);

        if (!result && DEBUG_DB) throw new DatabaseSideError("RESULT IS NULL", 400);

        const { data, errors, error_message, a_process_seqno } = result;

        if (errors) {
            if (!!errors.length) {
                throw new DatabaseSideError(errors, 400);
            }
            throw new DatabaseSideError(error_message, 400);
        }

        const passwordMatch = await checkHashPassword(merchant_loginpw, data[0].login_pwd);

        if (!passwordMatch) {
            const perror = [
                {
                    field: "a_login_credentials",
                    message: "Incorrect username or password"
                }
            ]
            throw new DatabaseSideError(perror, 400);
        }

        const { user_code, entity_code, bank_branch_code, client_code, parent_code, user_name, short_name, user_level, login_id, default_acc_year, default_quarter_no, default_tds_type_code, default_tran_month, add_right, edit_right, delete_right, query_right, print_right, approve_right, valuation_right, special_right, approvedby, approveddate, client_code_details, default_module_type_code, module_type_name, default_from_date, default_to_date, client_code_level, tanno, entity_name, user_role_code, user_role_str, first_time_login, first_level_client_code, iud_type, email_id, mobileno, sub_module_type_code_str, data_import_lastupdate, emp_client_code, user_emp_role_code, user_emp_role_name, app_kpi_code_str, is_pen_flag } = data[0];

        const { itmsapi } = JSON.parse(user_role_str);

        let projected_sal, fvc_bill_tran, salary_bill_tran, employee_mast, office_mast, vendor_mast, object_mast, salary_annex2_decl, salary_annex2_approved, vendor_comm_tran;

        if (itmsapi) {
            ({
                projected_sal,
                fvc_bill_tran,
                salary_bill_tran,
                employee_mast,
                office_mast,
                vendor_mast,
                object_mast,
                salary_annex2_decl,
                salary_annex2_approved,
                vendor_comm_tran
            } = itmsapi);
        }


        const user: JwtAuthData = {
            a_session_seqno: session_seqno, a_process_seqno, user_code, entity_code, client_code, bank_branch_code, parent_code, user_name, short_name, user_level, login_id, default_acc_year, default_quarter_no, default_tds_type_code, default_tran_month, add_right, edit_right, delete_right, query_right, print_right, approve_right, app_kpi_code_str, is_pen_flag,
            iud_type, valuation_right, special_right, approvedby, approveddate, client_code_details, default_module_type_code, module_type_name, default_from_date, default_to_date, client_code_level, tanno, entity_name, user_role_code, first_time_login, first_level_client_code, email_id, mobileno, sub_module_type_code_str, data_import_lastupdate, emp_client_code, user_emp_role_code, user_emp_role_name, itmsapi: itmsapi?.allowed ? { projected_sal: projected_sal?.allowed ? true : false, fvc_bill_tran: fvc_bill_tran?.allowed ? true : false, salary_bill_tran: salary_bill_tran?.allowed ? true : false, employee_mast: employee_mast?.allowed ? true : false, office_mast: office_mast?.allowed ? true : false, vendor_mast: vendor_mast?.allowed ? true : false, object_mast: object_mast?.allowed ? true : false, salary_annex2_decl: salary_annex2_decl?.allowed ? true : false, salary_annex2_approved: salary_annex2_approved?.allowed ? true : false, vendor_comm_tran: vendor_comm_tran?.allowed ? true : false } : false
        }
        let { accessToken, secretkey } = await generateTokens(user, '3m');
        accessToken = await encrypt(accessToken);

        return res.status(ok).send({ status: "SUCCESS", errdata: null, data: { merchantid: merchantid, secretkey, token: accessToken }, requestid: requestid });
    }
);
export { router as generateTokenRouter };