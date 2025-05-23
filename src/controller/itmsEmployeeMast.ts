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

// ITMS Employee Mast Insert Details (Insert/Update/Delete) – ITMS_MIUD_002
// rowid_seq, emp_code should be change every time we want to hit 

router.post('/employee-mast',
   validationRequest,
   [currentUser, requireAuth],
   validateSqlInjection,
   async (req: Request, res: Response) => {
      if (req?.currentUser !== undefined) {
         if (req?.currentUser?.itmsapi && req?.currentUser?.itmsapi?.employee_mast) {
            const { iud_seqno, a_iud_type, rowid_seq, emp_code, emp_panno, emp_name, desig, ddo_no, office_no, treasury_no, gender, address, city, state, pin_code, ifms_emp_status } = req.body;
            const procType = 'get_miud_itms_emp_mast';

            var sdata = sDataWriter(req, iud_seqno, `
               "a_process_seqno" : "",
               "a_iud_type" : "${a_iud_type}",
               "a_proc_type" : "${procType}",
               "a_user_code" : "${req?.currentUser?.user_code}",
               "a_process_status_code": "ZA",
               "a_db_total_records":"1000",
               "a_pagination_count":"0",
               "itms_emp_mast":
                  {
                     "rowid_seq":"${rowid_seq ? rowid_seq : ""}",
                     "emp_code":"${emp_code ? emp_code : ""}",
                     "emp_panno":"${emp_panno ? emp_panno : ""}",
                     "emp_name":"${emp_name ? emp_name : ""}",
                     "dob":"",
                     "desig":"${desig ? desig : ""}",
                     "ret_date":"",
                     "ddo_no":"${ddo_no ? ddo_no : ""}",
                     "office_no":"${office_no ? office_no : ""}",
                     "treasury_no":"${treasury_no ? treasury_no : ""}",
                     "gender":"${gender ? gender : ""}",
                     "address":"${address ? address : ""}",
                     "city":"${city ? city : ""}",
                     "state":"${state ? state : ""}",
                     "pin_code":"${pin_code ? pin_code : ""}",
                     "ifms_emp_status":"${ifms_emp_status ? ifms_emp_status : ""}",
                     "approvedby":"",
                     "approveddate":""
                  }
         `);

            const result: any = await execute(`BEGIN PKG_TAXCPC_APP.PROC_CALL_MAIN_INOUT(session_seqno_replace, iud_seqno_replace, :a_in_parameter_json,:a_out_parameter_json,'${req?.currentUser.user_code}');END;`, sdata, procType, req);

            

            if (!result && DEBUG_DB) throw new DatabaseSideError("RESULT IS NULL", 400);
            const { desc, errors, error_message, a_process_seqno, proc_type, success_msg, a_success_data, a_proc_error_message } = result;

            return res.status(ok).send({ status: "SUCCESS", errdata: errors ? errors : null, data: a_success_data ? a_success_data : null, message: success_msg ? success_msg : error_message });
         } else {
            return res.status(un_authorized).send({ status: "UN-Authorised", errdata: null, data: null, message: "You are not authorized to view the requested page." });
         }
      }
   }
);
export { router as employeeMastRouter };