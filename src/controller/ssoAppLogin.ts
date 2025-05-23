import { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import { JwtAuthData } from '../common/interface/jwt';
import { generateTokens } from '../common/secure/token';
import encrypt from '../config/aesHashToken';
import { execute } from '../config/db';
import { validationRequest } from '../middlewares/validate-request';
import sCode from '../common/status-codes';
import { DatabaseSideError } from '../errors/database-side-error';
import { DEBUG_DB } from '../config/envConfig';
import axios from 'axios';
import dotenv from 'dotenv';
import validateSqlInjection from '../middlewares/validateSqlInjection';
import path from 'path';
import * as fs from 'fs';
const { ok, server_error } = sCode;
const router = Router();
dotenv.config();
const { SSOSERVER_UAT_URL, WSUSERNAME, WSPASSWORD, SECRETKEY, SSO_APPLICATION_NAME } = process.env;
const crypto = require('crypto');
const generateKey = async (SECRETKEY: any) => {
    let key = SECRETKEY;
    key = SECRETKEY.slice(0, 16).padEnd(16, '0');
    return key;
}
const encryptAES = async (plainText: any, SECRETKEY: any) => {
    const key = SECRETKEY;
    const iv = Buffer.from(key);
    const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}
router.post('/login',
    [
        body('a_login_id').exists().withMessage('login id is required').trim().notEmpty(),
        body('a_login_pwd').exists().withMessage('Password is required').trim().notEmpty(),
    ],
    validationRequest,
    validateSqlInjection,
    async (req: Request, res: Response) => {
        const { a_login_id, a_login_pwd, session_seqno, iud_seqno } = req.body;
        const secretKey = SECRETKEY;
        const encryptedPassword = await encryptAES(a_login_pwd, secretKey);
        const response = await axios.post(`${SSOSERVER_UAT_URL}/SSOREST/SSOAuthenticationMobileNew`, {
            Application: SSO_APPLICATION_NAME,
            UserName: a_login_id,
            Password: encryptedPassword,
        });
        const { status, data } = response;
        if (status == 200 && data && data?.valid == true) {
            const ssoresponse = await axios.post(`${SSOSERVER_UAT_URL}/SSOREST/GetUserDetailJSON
                `, {
                SSOID: a_login_id,
                WSUSERNAME: WSUSERNAME,
                WSPASSWORD: WSPASSWORD
            });
            const { status: ssostatus, data: ssodata } = ssoresponse;
            const baseImage = ssodata?.jpegPhoto;
            if (ssodata.employeeNumber == null && ssodata.emp_code == null) throw new DatabaseSideError("Employee not registered please contact SSO", 400);
            const sdata = `{
                    "a_session_seqno": "session_seqno_replace",
                    "a_iud_seqno": "iud_seqno_replace",
                    "a_process_seqno": "",
                    "a_iud_type": "emp_code",
                    "a_proc_type": "get_gmdt_login_id",
                    "a_proc_error": "0",
                    "a_in_parameter_json": [
                        {
                            "a_login_id": "${ssodata.employeeNumber ?? ssodata.emp_code}",
                            "a_module_type_code":"TAXCPC"
                        }
                    ]
                }`;
            let result: any = await execute(`BEGIN PKG_TAXCPC_APP.PROC_CALL_MAIN_INOUT(session_seqno_replace, iud_seqno_replace, :a_in_parameter_json, :a_out_parameter_json,'ADMIN'); END;`, sdata, 'get_gmdt_login_id', req);
            if (!result && DEBUG_DB) throw new DatabaseSideError("RESULT IS NULL", 400);
            result = { ...result, baseImage }
            const { data, desc, errors, error_message, a_process_seqno, proc_type } = result;
            if (errors) {
                if (errors.length) { throw new DatabaseSideError(errors, 400); } throw new DatabaseSideError(error_message, 400);
            }
            const { user_code, entity_code, bank_branch_code, client_code, parent_code, user_name, short_name, user_level, login_id, default_acc_year, default_quarter_no, default_tds_type_code, default_tran_month, add_right, edit_right, delete_right, query_right, print_right, approve_right, valuation_right, special_right, approvedby, approveddate, client_code_details, default_module_type_code, module_type_name, default_from_date, default_to_date, client_code_level, tanno, entity_name, user_role_code, user_role_str, first_time_login, first_level_client_code, iud_type, email_id, mobileno, sub_module_type_code_str, data_import_lastupdate, emp_client_code, user_emp_role_code, user_emp_role_name,app_kpi_code_str, default_sub_module_type_code,is_pen_flag } = data[0];
            const { itmsapi } = JSON.parse(user_role_str);
            let projected_sal
            if (client_code_level == 0) {
                const perror = [
                    {
                        field: "a_login_pwd",
                        message: "You are not authenticated user to login this application."
                    }
                ]
                throw new DatabaseSideError(perror, 400);
            }
            if (itmsapi) {
                (projected_sal = itmsapi);
            }
            const user: JwtAuthData = {
                a_session_seqno: session_seqno, a_process_seqno, user_code, entity_code, bank_branch_code, client_code, parent_code, user_name, short_name, user_level, login_id, default_acc_year, default_quarter_no, default_tds_type_code, default_tran_month, add_right, edit_right, delete_right, query_right, iud_type, print_right, approve_right, valuation_right, special_right, approvedby, approveddate, client_code_details, default_module_type_code, module_type_name, default_from_date, default_to_date,app_kpi_code_str, client_code_level, tanno, entity_name, user_role_code, first_time_login, first_level_client_code, email_id, mobileno,default_sub_module_type_code, is_pen_flag,sub_module_type_code_str, data_import_lastupdate, emp_client_code, user_emp_role_code, user_emp_role_name, itmsapi: itmsapi?.allowed ? { projected_sal: projected_sal?.allowed ? true : false } : false
            }
            let { accessToken, refreshToken } = await generateTokens(user, "9000h");
            accessToken = await encrypt(accessToken);
            refreshToken = await encrypt(refreshToken);
            if (!refreshToken) return res.status(server_error).send({ status: "SERVER_ERROR", code: "SERVER_ERROR", errors: [{ "field": "server_error", "message": "Error while creating record" }] });
            const authdata: any = {
                user, accessToken, refreshToken, user_role_str, baseImage
            }
            return res.status(ok).send({ status: "SUCCESS", code: "SUCCESS", authdata, message: "Login successfully" });
        } else {
            if (data?.valid == false) {
                return res.status(server_error).send({ status: "SERVER_ERROR", code: "SERVER_ERROR", errors: [{ "message": data?.message ?? "Technical Error" }] });
            }
        }
    }
);
export { router as ssoAppLoginRouter };