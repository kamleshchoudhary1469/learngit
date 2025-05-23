import { Request, Response, Router } from 'express';
import { currentUser } from '../middlewares/current-user';
import { requireAuth } from '../middlewares/require-auth';
import sCode from '../common/status-codes';
import { execute } from '../config/db';
import { validationRequest } from '../middlewares/validate-request';
import { getNicuIdValidation } from '../common/itmsHelper';
import { DEBUG_DB } from '../config/envConfig';
import { DatabaseSideError } from '../errors/database-side-error';
import { sDataWriter } from '../common/sDataWriter';
import validateSqlInjection from '../middlewares/validateSqlInjection';
const { ok, un_authorized } = sCode;
const router = Router();

// IFMS Salary Bill Tran Insert Details (Insert/Update/Delete) – ITMS_TIUD_001
router.post('/salary-bill-tran',
    validationRequest,
    [currentUser, requireAuth],
    validateSqlInjection,
    async (req: Request, res: Response) => {
        if (req?.currentUser !== undefined) {
            if (req?.currentUser?.itmsapi && req?.currentUser?.itmsapi?.salary_bill_tran) {
                const { iud_seqno, ifms_salary_bill_tran } = req.body;
                const procType = 'get_tiud_ifms_salary_bill_tran';

                ifms_salary_bill_tran?.employee_details.reduce((acc: any, cur: any) => {
                    acc.push({ "nicuid": cur?.nicuid })
                    return acc;
                }, []).map(async (each: any, cur: any) => {
                });
                var sdata = sDataWriter(req, iud_seqno, `
                    "a_process_seqno" : "",
                    "a_iud_type" : "i",
                    "a_proc_type" : "${procType}",
                    "a_user_code" : "${req?.currentUser?.user_code}",
                    "a_process_status_code": "ZA",
                    "a_db_total_records":"1000",
                    "a_pagination_count":"0",
                    "ifms_salary_bill_tran": ${JSON.stringify(ifms_salary_bill_tran)}
                `);

                const result: any = await execute(`BEGIN PKG_TAXCPC_APP.PROC_CALL_MAIN_INOUT(session_seqno_replace, iud_seqno_replace,:a_in_parameter_json,:a_out_parameter_json,'${req?.currentUser.user_code}');END;`, sdata, procType, req);
                if (!result && DEBUG_DB) throw new DatabaseSideError("RESULT IS NULL", 400);
                const { desc, errors, error_message, a_process_seqno, proc_type, success_msg, a_success_data, a_proc_error_message } = result;
                const successData = a_success_data && a_success_data.reduce((acc: any, cur: any) => {
                    acc[cur?.field] = cur.value
                    return acc;
                }, {})

                return res.status(ok).send({ status: "SUCCESS", errdata: errors ? errors : null, data: successData ?? null, message: success_msg ? success_msg : error_message });
            } else {
                return res.status(un_authorized).send({ status: "UN-Authorised", errdata: null, data: null, message: "You are not authorized to view the requested page." });
            }
        }
    }
);
export { router as salaryBillTranRouter };