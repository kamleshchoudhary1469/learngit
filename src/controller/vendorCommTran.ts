import { Request, Response, Router } from 'express';
import { currentUser } from '../middlewares/current-user';
import { requireAuth } from '../middlewares/require-auth';
import sCode from '../common/status-codes';
import { execute} from '../config/db';
import { validationRequest } from '../middlewares/validate-request';
import { sDataWriter } from '../common/sDataWriter';
import validateSqlInjection from '../middlewares/validateSqlInjection';
const { ok, un_authorized } = sCode;
const router = Router();

// ITMS Vendor Comm Tran Details (Insert/Update/Delete) – ITMS_TIUD_002

router.post('/vendor-comm-tran',
    validationRequest,
    [currentUser, requireAuth],
    validateSqlInjection,
    async (req: Request, res: Response) => {
        if (req?.currentUser !== undefined) {
            if (req?.currentUser?.itmsapi && req?.currentUser?.itmsapi?.vendor_comm_tran) {
                const { iud_seqno, a_iud_type, rowid_seq, vendor_code, vendor_panno, vendor_gstn_no, object_head_code, tds_section, cumm_tran_amt, cumm_tds_amt, cumm_gst_amt } = req.body;
                const procType = 'get_tiud_ifms_vendor_cumm_tran';

                var sdata = sDataWriter(req, iud_seqno, `
               "a_process_seqno" : "",
               "a_iud_type" : "${a_iud_type}",
               "a_proc_type" : "${procType}",
               "a_user_code" : "${req?.currentUser?.user_code}",
               "a_process_status_code": "ZA",
               "a_db_total_records":"1000",
               "a_pagination_count":"0",
               "ifms_vendor_cumm_tran": {
                "rowid_seq":"${rowid_seq ? rowid_seq : ""}",
                "vendor_code":"${vendor_code ? vendor_code : ""}", 
                "vendor_panno":"${vendor_panno ? vendor_panno : ""}", 
                "vendor_gstn_no":"${vendor_gstn_no ? vendor_gstn_no : ""}", 
                "object_head_code":"${object_head_code ? object_head_code : ""}", 
                "tds_section":"${tds_section ? tds_section : ""}", 
                "cumm_tran_amt":"${cumm_tran_amt ? cumm_tran_amt : ""}", 
                "cumm_tds_amt":"${cumm_tds_amt ? cumm_tds_amt : ""}", 
                "cumm_gst_amt":"${cumm_gst_amt ? cumm_gst_amt : ""}", 
                "approvedby":"",
                "approveddate":""
            }
        `);

                const result: any = await execute(`BEGIN PKG_TAXCPC_APP.PROC_CALL_MAIN_INOUT(session_seqno_replace, iud_seqno_replace,:a_in_parameter_json,:a_out_parameter_json,'${req?.currentUser.user_code}');END;`, sdata, procType, req);
                const { desc, errors, error_message, a_process_seqno, proc_type, success_msg, a_success_data, a_proc_error_message } = result;

                return res.status(ok).send({ status: "SUCCESS", errdata: errors ? errors : null, data: a_success_data ? a_success_data : null, message: success_msg ? success_msg : error_message });
            } else {
                return res.status(un_authorized).send({ status: "UN-Authorised", errdata: null, data: null, message: "You are not authorized to view the requested page." });
            }
        }
    }
);
export { router as vendorCommTranRouter };