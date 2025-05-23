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

// IFMS Salary Annex2 Approved Insert Details (Insert/Update/Delete) – ITMS_TIUD_004

router.post('/salary-annex2-approved',
    validationRequest,
    [currentUser, requireAuth],
    validateSqlInjection,
    async (req: Request, res: Response) => {
        if (req?.currentUser !== undefined) {
            if (req?.currentUser?.itmsapi && req?.currentUser?.itmsapi?.salary_annex2_approved) {
                const { iud_seqno, a_iud_type, rowid_seq, treasury_no, ddo_no, office_no, pay_year, pay_month, emp_code, emp_name, emp_panno } = req.body;
                const procType = 'get_tiud_ifms_salary_annex2_approved';

                var sdata = sDataWriter(req, iud_seqno, `
                "a_process_seqno" : "",
                "a_iud_type" : "${a_iud_type}",
                "a_proc_type" : "${procType}",
                "a_user_code" : "${req?.currentUser?.user_code}",
                "a_process_status_code": "ZA",
                "a_db_total_records":"1000",
                "a_pagination_count":"0",
                "ifms_salary_annex2_approved": {
                    "rowid_seq":"${rowid_seq ? rowid_seq : ""}",
                    "treasury_no":"${treasury_no ? treasury_no : ""}", 
                    "ddo_no":"${ddo_no ? ddo_no : ""}", 
                    "office_no":"${office_no ? office_no : ""}",
                    "pay_year":"${pay_year ? pay_year : ""}", 
                    "pay_month":"${pay_month ? pay_month : ""}", 
                    "emp_code":"${emp_code ? emp_code : ""}",
                    "emp_name":"${emp_name ? emp_name : ""}", 
                    "emp_panno":"${emp_panno ? emp_panno : ""}", 
                    "itax_scheme_opt":"",
                    "afg01_tgsp_amt":"",
                    "afg01_pgsp_amt":"",
                    "afg01_tgpp_amt":"",
                    "afg01_pgpp_amt":"",
                    "afg01_pilp_amt":"",
                    "afg01_ppilp_amt":"",
                    "afg01_aoes_amt":"",
                    "afg02_iohl_amt":"",
                    "afg02_sd_amt":"",
                    "afg02_aoi_amt":"",
                    "afg02_aoipp_amt":"",
                    "afg02_tifhp_amt":"",
                    "afg03_dividend_amt":"",
                    "afg03_sbai_amt":"",
                    "afg03_oth_amt":"",
                    "afg04_hra_amt":"",
                    "afg04_gratuity_amt":"",
                    "afg04_lea_amt":"",
                    "afg04_tc_amt":"",
                    "afg04_cvop_amt":"",
                    "afg04_oth_amt":"",
                    "afg05_gpf_amt":"",
                    "afg05_tf_amt":"",
                    "afg05_ptsd_amt":"",
                    "afg05_ppf_amt":"",
                    "afg05_ccpf_amt":"",
                    "afg05_hlrp_amt":"",
                    "afg05_ip_amt":"",
                    "afg05_atdsb_amt":"",
                    "afg05_nss_amt":"",
                    "afg05_mf_amt":"",
                    "afg05_elss_amt":"",
                    "afg05_ssads_amt":"",
                    "afg05_poscss_amt":"",
                    "afg05_ccpf2_amt":"",
                    "afg05_cpscg_amt":"",
                    "afg06_cpscg_amt":"",
                    "afg06_medical_amt":"",
                    "afg06_mthp_amt":"",
                    "afg06_mtsd_amt":"",
                    "afg06_ipel_amt":"",
                    "afg06_iphl_amt":"",
                    "afg06_lthp_amt":"",
                    "afg06_ltev_amt":"",
                    "afg06_dfci_amt":"",
                    "afg06_drrp_amt":"",
                    "afg06_dcpp_amt":"",
                    "afg06_drisb_amt":"",
                    "afg06_dri_amt":"",
                    "afg06_dpd_amt":"",
                    "afg07_titc_amt":"",
                    "afg07_tcc_amt":"",
                    "afg07_tsc_amt":"",
                    "afg07_tt_amt":"",
                    "tanno":"",
                    "bsr_code":"",
                    "challan_no":"",
                    "challan_date":"",
                    "challan_amount":"",
                    "approvedby":"",
                    "approveddate":""
                }
            `);

                const result: any = await execute(`BEGIN PKG_TAXCPC_APP.PROC_CALL_MAIN_INOUT(session_seqno_replace, iud_seqno_replace,:a_in_parameter_json,:a_out_parameter_json,'${req?.currentUser.user_code}');END;`, sdata, procType, req);

                

                if (!result && DEBUG_DB) throw new DatabaseSideError("RESULT IS NULL", 400);
                const { desc, errors, error_message, a_process_seqno, proc_type, success_msg, a_success_data, a_proc_error_message } = result;

                return res.status(ok).send({ status: "SUCCESS", errdata: errors ? errors : null, data: a_success_data ? a_success_data : null, message: success_msg ? success_msg : error_message });
            } else {
                return res.status(un_authorized).send({ status: "UN-Authorised", errdata: null, data: null, message: "You are not authorized to view the requested page." });
            }
        }
    }
);
export { router as salaryAnnex2ApprovedRouter };