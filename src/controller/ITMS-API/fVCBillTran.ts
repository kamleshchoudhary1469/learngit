import { Request, Response, Router } from 'express';
import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import sCode from '../../common/status-codes';
import { execute } from '../../config/db';
import { validationRequest } from '../../middlewares/validate-request';
import { sDataWriter } from '../../common/sDataWriter';
import validateSqlInjection from '../../middlewares/validateSqlInjection';
import { DEBUG_DB } from '../../config/envConfig';
import { DatabaseSideError } from '../../errors/database-side-error';
const { ok, un_authorized } = sCode;
const router = Router();

// IFMS FVC Bill Tran Details (Insert/Update/Delete) – ITMS_TIUD_003

router.post('/fvc-bill-tran-v1',
    validationRequest,
    [currentUser, requireAuth],
    validateSqlInjection,
    async (req: Request, res: Response) => {
        if (req?.currentUser !== undefined) {
            if (req?.currentUser?.itmsapi && req?.currentUser?.itmsapi?.fvc_bill_tran) {

                const { iud_seqno, a_iud_type, requestid, source, request_type, rowid_seq, bill_type, object_head_code, budget_head_code, office_no, ddo_no, treasury_no, bill_id, bill_number, bill_date, pay_year, pay_month, vendor_code, vendor_name, vendor_panno, place_of_supply, vendor_gstn_no, contract_value, gross_inv_amt, basic_amt, tax_amt, gst_tds_amt, income_tax_tds_amt, if_exempted, exempted_reason
                } = req.body;

                const procType = 'get_tiud_ifms_fvc_bill_tran';

                var sdata = sDataWriter(req, iud_seqno, `
                    "a_process_seqno" : "",
                    "a_iud_type" : "${a_iud_type}",
                    "a_proc_type" : "${procType}",
                    "a_user_code" : "${req?.currentUser?.user_code}",
                    "a_process_status_code": "ZA",
                    "a_db_total_records":"1000",
                    "a_pagination_count":"0",
                    "ifms_fvc_bill_tran": {
                        "requestid": "${requestid ?? ""}",
                        "source": "${source ?? ""}",
                        "request_type": "${request_type ?? ""}",
                        "a_iud_type": "${a_iud_type ?? ""}",
                        "rowid_seq": "${rowid_seq ?? ""}",
                        "bill_type": "${bill_type ?? ""}",
                        "object_head_code": "${object_head_code ?? ""}",
                        "office_no": "${office_no ?? ""}",
                        "ddo_no": "${ddo_no ?? ""}",
                        "treasury_no": "${treasury_no ?? ""}",
                        "vendor_code": "${vendor_code ?? ""}",
                        "vendor_name": "${vendor_name ?? ""}",
                        "vendor_panno": "${vendor_panno ?? ""}",
                        "vendor_gstn_no": "${vendor_gstn_no ?? ""}",
                        "contract_value": "${contract_value ?? ""}",
                        "gross_inv_amt": "${gross_inv_amt ?? ""}",
                        "basic_amt": "${basic_amt ?? ""}",
                        "tax_amt": "${tax_amt ?? ""}",
                        "gst_tds_amt": "${gst_tds_amt ?? ""}",
                        "income_tax_tds_amt": "${income_tax_tds_amt ?? ""}",
                        "if_exempted": "${if_exempted ?? ""}",
                        "bill_id": "${bill_id ?? ""}",
                        "bill_number": "${bill_number ?? ""}",
                        "bill_date": "${bill_date ?? ""}",
                        "pay_year": "${pay_year ?? ""}",
                        "pay_month": "${pay_month ?? ""}",
                        "place_of_supply": "${place_of_supply ?? ""}",
                        "budget_head_code": "${budget_head_code ?? ""}",
                        "exempted_reason": "${exempted_reason ?? ""}"
                    }
                `);

                console.log(sdata, 'sdata of fvc-bill-tran')

                const result: any = await execute(`BEGIN PKG_TAXCPC_APP.PROC_CALL_MAIN_INOUT(session_seqno_replace, iud_seqno_replace,:a_in_parameter_json,:a_out_parameter_json,'${req?.currentUser.user_code}');END;`, sdata, procType, req);

                if (!result && DEBUG_DB) throw new DatabaseSideError("RESULT IS NULL", 400);

                const { desc, errors, error_message, a_process_seqno, proc_type, success_msg, a_success, a_proc_error_message } = result;

                const successData = { "data": a_success?.[1]?.data ?? null, "requestid": a_success?.[0]?.requestid ?? null }

                return res.status(ok).send({ status: "SUCCESS", errdata: errors ? errors : null, data: successData ?? null, message: success_msg ? success_msg : error_message });
            } else {
                return res.status(un_authorized).send({ status: "UN-Authorised", errdata: null, data: null, message: "You are not authorized to view the requested page." });
            }
        }
    }
);
export { router as fVCBillTranRouter };