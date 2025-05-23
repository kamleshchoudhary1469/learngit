import { Request, Response, Router } from 'express';
import { currentUser } from '../middlewares/current-user';
import { requireAuth } from '../middlewares/require-auth';
import sCode from '../common/status-codes';
import { execute } from '../config/db';
import { validationRequest } from '../middlewares/validate-request';
import { sDataWriter } from '../common/sDataWriter';
import validateSqlInjection from '../middlewares/validateSqlInjection';
import { DEBUG_DB } from '../config/envConfig';
import { DatabaseSideError } from '../errors/database-side-error';
const { ok, un_authorized } = sCode;
const router = Router();

// IFMS FVC Bill Tran Details (Insert/Update/Delete) –
router.post('/fvc-bill-tran-old',
    validationRequest,
    [currentUser, requireAuth],
    validateSqlInjection,
    async (req: Request, res: Response) => {
        if (req?.currentUser !== undefined) {
            if (req?.currentUser?.itmsapi && req?.currentUser?.itmsapi?.fvc_bill_tran) {
                const { iud_seqno, a_iud_type, rowid_seq, treasury_no, ddo_no, office_no, bill_id, bill_name, object_head_code, object_head_name, budget_head_code, pay_year, pay_month, bill_number, bill_date, vendor_code, vendor_panno, vendor_name, vendor_gstn_no, approved_vrno, approved_vrdate, invoice_no, invoice_date, gross_inv_amt, basic_amt, tax_amt, gst_tds_amt, income_tax_tds_amt, if_exempted, exempted_reason } = req.body;
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
                        "rowid_seq":"${rowid_seq ? rowid_seq : ""}",
                        "treasury_no":"${treasury_no ? treasury_no : ""}", 
                        "ddo_no":"${ddo_no ? ddo_no : ""}", 
                        "office_no":"${office_no ? office_no : ""}",
                        "bill_id":"${bill_id ? bill_id : ""}", 
                        "bill_name":"${bill_name ? bill_name : ""}", 
                        "object_head_code":"${object_head_code ? object_head_code : ""}",
                        "object_head_name":"${object_head_name ? object_head_name : ""}", 
                        "budget_head_code":"${budget_head_code ? budget_head_code : ""}",
                        "pay_year":"${pay_year ? pay_year : ""}", 
                        "pay_month":"${pay_month ? pay_month : ""}",
                        "bill_number":"${bill_number ? bill_number : ""}", 
                        "bill_date":"${bill_date ? bill_date : ""}", 
                        "vendor_code":"${vendor_code ? vendor_code : ""}",
                        "vendor_panno":"${vendor_panno ? vendor_panno : ""}", 
                        "vendor_name":"${vendor_name ? vendor_name : ""}", 
                        "vendor_gstn_no":"${vendor_gstn_no ? vendor_gstn_no : ""}",
                        "approved_vrno":"${approved_vrno ? approved_vrno : ""}", 
                        "approved_vrdate":"${approved_vrdate ? approved_vrdate : ""}", 
                        "invoice_no":"${invoice_no ? invoice_no : ""}",
                        "invoice_date":"${invoice_date ? invoice_date : ""}", 
                        "gross_inv_amt":"${gross_inv_amt ? gross_inv_amt : ""}", 
                        "basic_amt":"${basic_amt ? basic_amt : ""}",
                        "tax_amt":"${tax_amt ? tax_amt : ""}", 
                        "gst_tds_amt":"${gst_tds_amt ? gst_tds_amt : ""}", 
                        "income_tax_tds_amt":"${income_tax_tds_amt ? income_tax_tds_amt : ""}",
                        "if_exempted":"${if_exempted ? if_exempted : ""}", 
                        "exempted_reason":"${exempted_reason ? exempted_reason : ""}", 
                        "approvedby":"",
                        "approveddate":""
                    }
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
export { router as fVCBillTranOldRouter };