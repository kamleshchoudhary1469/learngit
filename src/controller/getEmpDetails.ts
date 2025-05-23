import { Request, Response, Router } from 'express';
import { currentUser } from '../middlewares/current-user';
import { requireAuth } from '../middlewares/require-auth';
import sCode from '../common/status-codes';
import { execute } from '../config/db';
import { validationRequest } from '../middlewares/validate-request';
import { DEBUG_DB } from '../config/envConfig';
import { DatabaseSideError } from '../errors/database-side-error';
import { sDataWriter } from '../common/sDataWriter';
import validateSqlInjection from '../middlewares/validateSqlInjection';
const { ok } = sCode;
const router = Router();

// ITMS Vendor Mast Insert Details (Insert/Update/Delete) – ITMS_MIUD_003
// rowid_seq, vendor_code should be change every time we want to hit 

router.post('/get-emp-detail/:type',
    validationRequest,
    [currentUser, requireAuth],
    validateSqlInjection,
    async (req: Request, res: Response) => {
        if (req?.currentUser !== undefined) {
            const { iud_seqno, rowid_seq, identifcation_no } = req.body;
            const { type } = req.params;
            const procType = type;
            console.log(req?.currentUser, "req?.currentUser")
            var sdata = sDataWriter(req, iud_seqno, `
               "a_process_seqno" : "",
               "a_iud_type" : "",
               "a_proc_type" : "${procType}",
               "a_user_code" : "${req?.currentUser?.user_code}",
               "a_in_parameter_json":[{ "a_rowid_seq": "${rowid_seq ?? identifcation_no ?? req?.currentUser?.user_code}"}]
            `);

            const result: any = await execute(`BEGIN PKG_TAXCPC_APP.PROC_CALL_MAIN_INOUT(session_seqno_replace, iud_seqno_replace,:a_in_parameter_json,:a_out_parameter_json,'${req?.currentUser.user_code}');END;`, sdata, procType, req);



            if (!result && DEBUG_DB) throw new DatabaseSideError("RESULT IS NULL", 400);
            const { desc, errors, error_message, a_process_seqno, proc_type, success_msg, a_success_data, a_proc_error_message, data } = result;

            const { [`${procType}_header`]: header, [`${procType}_detail`]: detail } = data;

            return res.status(ok).send({ status: "SUCCESS", errdata: errors ? errors : null, data: { detail, header }, message: success_msg ? success_msg : error_message });
        }
    }
);
export { router as getEmpDetailRouter };