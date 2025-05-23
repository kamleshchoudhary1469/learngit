import { Request, Response, Router } from 'express';
import { currentUser } from '../middlewares/current-user';
import { requireAuth } from '../middlewares/require-auth';
import sCode from '../common/status-codes';
import { execute} from '../config/db';
import { validationRequest } from '../middlewares/validate-request';
import { DEBUG_DB } from '../config/envConfig';
import { DatabaseSideError } from '../errors/database-side-error';
import { sDataWriter } from '../common/sDataWriter';
import validateSqlInjection from '../middlewares/validateSqlInjection';
const { ok, un_authorized } = sCode;
const router = Router();

// ITMS Vendor Mast Insert Details (Insert/Update/Delete) – ITMS_MIUD_003
// rowid_seq, vendor_code should be change every time we want to hit 

router.post('/vendor-mast',
    validationRequest,
    [currentUser, requireAuth],
   validateSqlInjection,
    async (req: Request, res: Response) => {
        if (req?.currentUser !== undefined) {
            if (req?.currentUser?.itmsapi && req?.currentUser?.itmsapi?.vendor_mast) {
                const { iud_seqno, a_iud_type, rowid_seq, vendor_code, vendor_panno, vendor_name, vendor_gstn_no, office_no, service_type, ifms_vendor_status } = req.body;
                const procType = 'get_miud_itms_vendor_mast';

                var sdata = sDataWriter(req, iud_seqno, `
                   "a_process_seqno" : "",
                   "a_iud_type" : "${a_iud_type}",
                   "a_proc_type" : "${procType}",
                   "a_user_code" : "${req?.currentUser?.user_code}",
                   "a_process_status_code": "ZA",
                   "a_db_total_records":"1000",
                   "a_pagination_count":"0",
                   "itms_vendor_mast": {
                   "rowid_seq":"${rowid_seq ? rowid_seq : ""}",
                   "vendor_code":"${vendor_code ? vendor_code : ""}", 
                   "vendor_panno":"${vendor_panno ? vendor_panno : ""}", 
                   "vendor_name":"${vendor_name ? vendor_name : ""}",
                   "vendor_gstn_no":"${vendor_gstn_no ? vendor_gstn_no : ""}", 
                   "office_no":"${office_no ? office_no : ""}", 
                   "service_type":"${service_type ? service_type : ""}",
                   "ifms_vendor_status":"${ifms_vendor_status ? ifms_vendor_status : ""}", 
                   "approvedby":"",
                   "approveddate":""
               }
            `);

                const result: any = await execute(`BEGIN PKG_TAXCPC_APP.PROC_CALL_MAIN_INOUT(session_seqno_replace, iud_seqno_replace, ${iud_seqno},:a_in_parameter_json,:a_out_parameter_json,'${req?.currentUser.user_code}');END;`, sdata, procType, req);

                

                if (!result && DEBUG_DB) throw new DatabaseSideError("RESULT IS NULL", 400);

                const { desc, errors, error_message, a_process_seqno, proc_type, success_msg, a_success_data, a_proc_error_message } = result;

                return res.status(ok).send({ status: "SUCCESS", errdata: errors ? errors : null, data: a_success_data ? a_success_data : null, message: success_msg ? success_msg : error_message });
            } else {
                return res.status(un_authorized).send({ status: "Un-Authorised", errdata: null, data: null, message: "You are not authorized to view the requested page." });
            }
        }
    }
);
export { router as itmsVendorMastRouter };