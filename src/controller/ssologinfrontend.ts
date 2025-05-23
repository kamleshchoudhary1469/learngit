import { NextFunction, Request, Response, Router } from 'express';
import sCode from '../common/status-codes';
import { validationRequest } from '../middlewares/validate-request';
import { body } from 'express-validator';
import axios from 'axios';
import dotenv from 'dotenv';
import { DatabaseSideError } from '../errors/database-side-error';
import { execute } from '../config/db';
import { JwtAuthData } from '../common/interface/jwt';
import { generateTokens } from '../common/secure/token';
import encrypt from '../config/aesHashToken';
const { ok, server_error } = sCode;
import { DEBUG_DB } from '../config/envConfig';
import validateSqlInjection from '../middlewares/validateSqlInjection';
import { payloadDecrypter } from '../common/interface/chunkDecrypter';

dotenv.config();
const { SSOSERVER_UAT_URL, WSUSERNAME, WSPASSWORD } = process.env;

const router = Router();

router.post('/ssologin',
    async (req: Request, res: Response, next: NextFunction) => {
        req.body = await payloadDecrypter(req?.body);
        next();
    },
    [
        body('userdetails').exists().withMessage('User details is required').trim().notEmpty(),
        body('service').optional()
    ],
    validationRequest,
    validateSqlInjection,
    async (req: Request, res: Response) => {

        const config = {
            headers: { "User-Agent": "curl/7.64.1" }
        };

        // try {
        const { userdetails, session_seqno, iud_seqno, service, loginType } = req.body;
        const url = `${SSOSERVER_UAT_URL}/SSOREST/GetTokenDetailJSON/${userdetails}`;

        const response = await axios.get(url, config);

        const { status, data } = response;


        if (status == 200 && data && data?.sAMAccountName) {
            const { sAMAccountName } = data;

            const ssoresponse = await axios.post(`${SSOSERVER_UAT_URL}/SSOREST/GetUserDetailJSON`, {
                SSOID: sAMAccountName,
                WSUSERNAME: WSUSERNAME,
                WSPASSWORD: WSPASSWORD
            });
            const { status: ssostatus, data: ssodata } = ssoresponse;
            if (ssodata == null) throw new DatabaseSideError("Employee number is null", 400);

            if (ssostatus == 200 && ssodata) {

                if (ssodata.employeeNumber == null && ssodata.emp_code == null)
                    return res.status(ok).send(`
                    <html>
                    <link rel="stylesheet" href="/staticemp/intermediatestyles.css">
                    <body>
                        <div class="notreg">
                            <h2>Sorry, your SSO id is not associated with this portal, please contact administartor.<br>
                           <a href="https://sso.rajasthan.gov.in/signin"> Try another SSO login</a>
                            </h2>
                        </div>
                    </body>
                    </html>`);

                const sdata = `{
                        "a_session_seqno": "session_seqno_replace",
                        "a_iud_seqno": "iud_seqno_replace",
                        "a_process_seqno": "",
                        "a_iud_type": "emp_code",
                        "a_proc_type": "get_gmdt_login_id",
                        "a_proc_error": "0",
                        "a_module_type_code":"TAXCPC",
                        "a_in_parameter_json": [
                            {
                                "a_login_id": "${ssodata.employeeNumber ?? ssodata.emp_code}",
                                "a_module_type_code":"TAXCPC"
                            }
                        ]
                    }`;

                const result: any = await execute(`BEGIN PKG_TAXCPC_APP.PROC_CALL_MAIN_INOUT(session_seqno_replace, iud_seqno_replace, :a_in_parameter_json, :a_out_parameter_json,'ADMIN'); END;`, sdata, 'get_gmdt_login_id', req);



                if (!result && DEBUG_DB) throw new DatabaseSideError("RESULT IS NULL", 400);

                const { data, desc, errors, error_message, a_process_seqno, proc_type } = result;

                if (errors) {
                    if (errors.length) {
                        throw new DatabaseSideError(errors, 400);
                    }
                    throw new DatabaseSideError(error_message, 400);
                }
                const { user_code, entity_code, bank_branch_code, client_code, parent_code, user_name, short_name, user_level, login_id, default_acc_year, default_quarter_no, default_tds_type_code, default_tran_month, add_right, edit_right, delete_right, query_right, print_right, approve_right, valuation_right, special_right, approvedby, approveddate, client_code_details, default_module_type_code, module_type_name, default_from_date, default_to_date, client_code_level, tanno, entity_name, user_role_code, user_role_str, first_time_login, first_level_client_code, iud_type, email_id, mobileno, sub_module_type_code_str, data_import_lastupdate, emp_client_code, user_emp_role_code, user_emp_role_name, app_kpi_code_str,is_pen_flag } = data[0];

                if (client_code_level == 0) {
                    const perror = [
                        {
                            field: "a_login_pwd",
                            message: "You are not authenticated user to login this application."
                        }
                    ]
                    throw new DatabaseSideError(perror, 400);

                }

                const user: JwtAuthData = {
                    a_session_seqno: session_seqno, a_process_seqno, user_code, entity_code, bank_branch_code, client_code, parent_code, user_name, short_name, user_level, login_id, default_acc_year, default_quarter_no, default_tds_type_code, default_tran_month, add_right, edit_right, delete_right, query_right, print_right, approve_right, valuation_right, special_right, approvedby, approveddate, client_code_details, default_module_type_code, module_type_name, default_from_date, default_to_date, client_code_level, tanno, entity_name, user_role_code, first_time_login, first_level_client_code, iud_type: loginType ? 'emp_code' : 'login_id', email_id, mobileno, sub_module_type_code_str, data_import_lastupdate, emp_client_code, user_emp_role_code, user_emp_role_name, app_kpi_code_str,is_pen_flag
                }

                let { accessToken, refreshToken } = await generateTokens(user);
                accessToken = await encrypt(accessToken);
                refreshToken = await encrypt(refreshToken);
                if (!refreshToken) return res.status(server_error).send({ status: "SERVER_ERROR", code: "SERVER_ERROR", errors: [{ "field": "server_error", "message": "Error while creating record" }] });
                const authdata: any = {
                    user, accessToken, refreshToken, user_role_str, iud_type
                }

                return res.status(ok).send({ status: "SUCCESS", code: "SUCCESS", authdata: { ...authdata, servicepage: service, encDob: req.headers?.idenkey }, message: "Login successfully", servicepage: service });
            }
        } else {
            throw new DatabaseSideError("not getting sAMAccountName", 500);
        }
    }
);
export { router as ssoLoginFrontRouter };