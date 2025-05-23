import { Request, Response, Router } from 'express';
import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import sCode from '../../common/status-codes';
import { execute } from '../../config/db';
import { validationRequest } from '../../middlewares/validate-request';
import { sDataWriter } from '../../common/sDataWriter';
import { DEBUG_DB } from '../../config/envConfig';
import { DatabaseSideError } from '../../errors/database-side-error';
import validateSqlInjection from '../../middlewares/validateSqlInjection';
const { ok, un_authorized } = sCode;
const router = Router();

router.post('/projected-sal',
    validationRequest,
    [currentUser, requireAuth],
    validateSqlInjection,
    async (req: Request, res: Response) => {

        if (req?.currentUser !== undefined) {
            if (req?.currentUser?.itmsapi && req?.currentUser?.itmsapi?.projected_sal) {
                const { iud_seqno, requestid, emp_code, fin_year, acc_year } = req.body;

                const procType = 'get_gtdt_ifms_salary_tran_load_summ';
                var sdata = `{
                    "a_session_seqno": "session_seqno_replace",
                        "a_iud_seqno": "iud_seqno_replace",
                        "a_login_type": "${req?.currentUser.iud_type ?? ""}",
                        "a_module_type_code":"${req?.currentUser.default_module_type_code ?? ""}",
                        "a_sub_module_type_code":"${req?.currentUser?.default_sub_module_type_code ?? ""}",
                        "a_entity_code": "${req?.currentUser.entity_code}",
                        "a_client_code": "${req?.currentUser.client_code}",
                        "a_quarter_no": "${req?.currentUser.default_quarter_no}",
                        "a_tran_month": "${req?.currentUser.default_tran_month}",
                        "a_tran_from_date": "${req?.currentUser.default_from_date}",
                        "a_tran_to_date": "${req?.currentUser.default_to_date}",
                        "a_tds_type_code": "${req?.currentUser.default_tds_type_code}",
                        "a_acc_year": "${fin_year ?? acc_year ?? req?.currentUser?.default_acc_year}",
                        "a_is_pen_flag":"${req?.currentUser?.is_pen_flag ?? ""}",
                        "a_validation_client_level":"${req?.currentUser.client_code_level ?? ''}",
                        "a_first_level_client_code": "${req?.currentUser.first_level_client_code ?? ""}",
                        "a_process_seqno":"",
                        "a_proc_type":"${procType}",
                        "a_proc_error":"0",
                        "a_db_total_records":"1000",
                        "a_pagination_count":"0",
                        "requestid":"${requestid ?? ""}",
                        "emp_code":"${emp_code ?? ""}",
                        "fin_year":"${fin_year ?? ""}",
                        "a_in_parameter_json":[{"a_rowid_seq":"${emp_code ?? ""}"}]
                    }`
                const result: any = await execute(`BEGIN PKG_TAXCPC_APP.PROC_CALL_MAIN_INOUT(session_seqno_replace, iud_seqno_replace,:a_in_parameter_json,:a_out_parameter_json,'${req?.currentUser.user_code}');END;`, sdata, procType, req);
                if (!result && DEBUG_DB) throw new DatabaseSideError("RESULT IS NULL", 400);
                const { data, errors, error_message, a_process_seqno, proc_type, success_msg, a_proc_error_message } = result;
                return res.status(ok).send({ status: "SUCCESS", errdata: errors ? errors : null, data: data ? data : null, requestid: requestid, message: success_msg ? success_msg : error_message });
            } else {
                return res.status(un_authorized).send({ status: "UN-Authorised", errdata: null, data: null, message: "You are not authorized to view the requested page." });
            }
        }

    }
);
export { router as salaryTranLoadSummRouter };