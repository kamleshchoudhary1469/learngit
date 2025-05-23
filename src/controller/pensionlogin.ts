import { NextFunction, Request, Response, Router } from 'express';
import sCode from '../common/status-codes';
import { validationRequest } from '../middlewares/validate-request';
import { body } from 'express-validator';
import { DatabaseSideError } from '../errors/database-side-error';
import { CLIENT_AUTH_STORAGE_KEY, CLIENT_DEFAULT_AUTH_STORAGE_KEY, CLIENT_SESSION_STORAGE_KEY, DEBUG_DB, ISMAINTENANCE, REACT_APP_BASEPATH } from '../config/envConfig';
import validateSqlInjection from '../middlewares/validateSqlInjection';
import { execute } from '../config/db';
import axios from 'axios';
import { JwtAuthData } from '../common/interface/jwt';
import { generateTokens } from '../common/secure/token';
import encrypt from '../config/aesHashToken';
import path from 'path';
const { ok, server_error, bad_request } = sCode;
const { SSOSERVER_UAT_URL, WSUSERNAME, WSPASSWORD } = process.env;

const x: any = {
    "DDO": "itms",
    "TO": "itms/24g/",
}

const router = Router();

router.post('/generate-token/pensionlogin',
    async (req: Request, res: Response, next: NextFunction) => {
        req.headers.homeorigin = "/itms";
        next();
    },
    [
        // body('userdetails').exists().withMessage('User details is required').trim().notEmpty(),
        // body('ppono').exists().withMessage('ppono is required').trim().notEmpty(),
        // body('Accno').exists().withMessage('Accno is required').trim().notEmpty(),
        // body('service').optional()
    ],
    validationRequest,
    validateSqlInjection,
    async (req: Request, res: Response) => {
        if (ISMAINTENANCE) {
            return res.status(ok).send(`<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>System Update</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                        }

                        .container {
                            text-align: center;
                            padding: 20px;
                            background-color: #ffffff;
                            border-radius: 8px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                            max-width: 400px;
                        }

                        h1 {
                            color: #333;
                            font-size: 24px;
                        }

                        p {
                            color: #666;
                            font-size: 16px;
                        }

                        .loader {
                            margin-top: 20px;
                            border: 4px solid #f3f3f3;
                            border-top: 4px solid #3498db;
                            border-radius: 50%;
                            width: 50px;
                            height: 50px;
                            animation: spin 2s linear infinite;
                        }

                        @keyframes spin {
                            0% {
                                transform: rotate(0deg);
                            }

                            100% {
                                transform: rotate(360deg);
                            }
                        }
                    </style>
                </head>

                <body>
                    <div class="container">
                        <h1>Application is updating...</h1>
                        <p>Please try again later. We appreciate your patience.</p>
                    </div>
                </body>

                </html>`);
        }


        try {


            const ppono = "1049415";
            const Accno = "9901";
            const service = "PEN";
            // const { ppono, Accno, service } = req.body;

            // return res.status(ok).send(`'<html><body>Loading ...<script>  window.location.href ="/${REACT_APP_BASEPATH}/?${userdetails}?${service}";  </script></body></html>'`);

            let sdata = "";
            let jpegPhoto = "";

            // try {
            if (ppono == null && Accno == null) {
                return res.status(ok).send(`<html><link rel="stylesheet" href="/staticemp/intermediatestyles.css"><body><div class="notreg"><h2>Apologies, the employee code is not associated with your SSO ID. Please ensure the employee code is mapped with SSO ID and try again later.<br><a href="https://sso.rajasthan.gov.in/signin"> Try another SSO login</a></h2></div></body></html>`);
            }

            sdata = `{
                        "a_session_seqno": "session_seqno_replace",
                        "a_iud_seqno": "iud_seqno_replace",
                        "a_process_seqno": "",
                        "a_iud_type": "emp_code",
                        "a_proc_type": "get_gmdt_login_id",
                        "a_proc_error": "0",
                        "a_module_type_code":"TAXCPC",
                        "a_in_parameter_json": [
                            {
                                "a_login_id": "${ppono}",
                                "a_module_type_code":"TAXCPC"
                            }
                        ]
                    }`;
            jpegPhoto = "";
            const result: any = await execute(`BEGIN PKG_TAXCPC_APP.PROC_CALL_MAIN_INOUT(session_seqno_replace,iud_seqno_replace, :a_in_parameter_json, :a_out_parameter_json,'ADMIN'); END;`, sdata, 'get_gmdt_login_id', req);
            console.log(result, "result")

            if (!result && DEBUG_DB) throw new DatabaseSideError("RESULT IS NULL", 400);

            const { data, desc, errors, error_message, a_process_seqno, proc_type } = result;

            if (errors) {
                // if (errors.length) {
                //     throw new DatabaseSideError(errors, 400);
                // }
                // throw new DatabaseSideError(error_message, 400);
                return res.status(bad_request).send(`<html><link rel="stylesheet" href="/staticemp/intermediatestyles.css"><body><div class="notreg"><h2> ${!x?.[service] ? "Apologies, the employee code associated with your SSO ID is not found in the RITMS employee master. Please contact the RITMS helpdesk for further assistance." : "Apologies, the employee code associated with your SSO ID does not have access to this module. Please contact the RITMS helpdesk for further assistance."}<br><a href="https://sso.rajasthan.gov.in/signin"> Try another SSO login</a></h2></div></body></html>`);
            }

            const { user_code, entity_code, bank_branch_code, client_code, parent_code, user_name, short_name, user_level, login_id, default_acc_year, default_quarter_no, default_tds_type_code, default_tran_month, add_right, edit_right, delete_right, query_right, print_right, approve_right, valuation_right, special_right, approvedby, approveddate, client_code_details, default_module_type_code, module_type_name, default_from_date, default_to_date, client_code_level, tanno, entity_name, user_role_code, user_role_str, first_time_login, first_level_client_code, iud_type, email_id, mobileno, sub_module_type_code_str, data_import_lastupdate, emp_client_code, user_emp_role_code, user_emp_role_name, app_kpi_code_str, default_sub_module_type_code, is_pen_flag } = data[0];

            const { itmsapi } = JSON.parse(user_role_str);

            let projected_sal, fvc_bill_tran, salary_bill_tran, employee_mast, office_mast, vendor_mast, object_mast, salary_annex2_decl, salary_annex2_approved, vendor_comm_tran;

            if (client_code_level == 0) {
                const perror = [
                    {
                        field: "a_login_pwd",
                        message: "You are not authenticated user to login this application."
                    }
                ]
                throw new DatabaseSideError(perror, 400);

            }


            const requiredParams = [
                'client_code',
                'default_acc_year',
                'default_quarter_no',
                'default_tran_month',
                'default_from_date',
                'default_to_date',
                'default_tds_type_code',
                'default_module_type_code',
                'default_sub_module_type_code'
            ];

            const missingParams = requiredParams.filter(param => !eval(param));

            if (missingParams.length > 0) {
                throw new DatabaseSideError(`Missing parameters: ${missingParams.join(', ')}`, 400);
            }

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
                a_session_seqno: "session_seqno_replace", a_process_seqno, user_code, entity_code, bank_branch_code, client_code, parent_code, user_name, short_name, user_level, login_id, default_acc_year, default_quarter_no, default_tds_type_code, default_tran_month, add_right, edit_right, delete_right, query_right, print_right, approve_right, valuation_right, special_right, approvedby, approveddate, client_code_details, default_module_type_code, module_type_name, default_from_date, default_to_date, client_code_level, tanno, entity_name, user_role_code, default_sub_module_type_code, first_time_login, is_pen_flag, first_level_client_code, iud_type: !x?.[service] ? "emp_code" : "login_id", email_id, mobileno, sub_module_type_code_str, data_import_lastupdate, emp_client_code, user_emp_role_code, user_emp_role_name, app_kpi_code_str, itmsapi: itmsapi?.allowed ? { projected_sal: projected_sal?.allowed ? true : false, fvc_bill_tran: fvc_bill_tran?.allowed ? true : false, salary_bill_tran: salary_bill_tran?.allowed ? true : false, employee_mast: employee_mast?.allowed ? true : false, office_mast: office_mast?.allowed ? true : false, vendor_mast: vendor_mast?.allowed ? true : false, object_mast: object_mast?.allowed ? true : false, salary_annex2_decl: salary_annex2_decl?.allowed ? true : false, salary_annex2_approved: salary_annex2_approved?.allowed ? true : false, vendor_comm_tran: vendor_comm_tran?.allowed ? true : false } : false
            }

            let { accessToken, refreshToken } = await generateTokens(user);
            accessToken = await encrypt(accessToken);
            refreshToken = await encrypt(refreshToken);
            if (!refreshToken) return res.status(server_error).send({ status: "SERVER_ERROR", code: "SERVER_ERROR", errors: [{ "field": "server_error", "message": "Error while creating record" }] });

            const authdata: any = {
                user, accessToken, refreshToken, user_role_str, iud_type
            }


            return res.status(ok).send(`<html>
            <link rel="stylesheet" href="/staticemp/intermediatestyles.css">
            <body>
            <div class="main-page">
            <span class="apploader" id="loader">
                <img src='/staticemp/assets/img/RITMS_LOGO.png' alt="apploader" />
            </span>
            <div class="intermediate-comp" id="intermediate">
                <div class="card">
                    <div class="header">
                        <span><i>Select</i></span>
                        <h6>SPACE</h6>
                    </div>
                    <div class="card-body">
                        <a class="card box" id="workspace">
                            <div>
                                <h4>Access <br /> Workspace</h4>
                                <img src="/staticemp/assets/img/space-workspace.svg" alt="workspace" />
                            </div>
                        </a>
                        <a class="card box" id="selfservice">
                            <div>
                                <h4>Access <br /> Employee Self Service</h4>
                                <img src="/staticemp/assets/img/space-selfservice.svg" alt="Selfservice" />
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
                </body>
            <script>
                window.nightManager=()=>{
                    return ${JSON.stringify({ ...authdata, profileImg: jpegPhoto, servicepage: service, userdetails: ppono })}
                }
                 </script><script src="/staticemp/intermediate.js"></script></html>`);



        }
        catch (error) {
            if (error) {
                if (error.length) {
                    throw new DatabaseSideError(error, 500);
                }
                throw new DatabaseSideError("server side error", 500);
            }
        }
    }
);

router.get('/generate-token/pensionlogin', (req, res) => res.sendFile(path.join(__dirname, 'html.html')));
export { router as pensionLoginRouter };