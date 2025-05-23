import { Router } from "express";
import { generateTokenRouter } from "../controller/ITMS-API/generateToken";
import { salaryBillTranRouter } from "../controller/salaryBillTran";
import { salaryAnnex2ApprovedRouter } from "../controller/salaryAnnex2Approved";
import { salaryAnnex2ADECLRouter } from "../controller/salaryAnnex2ADECL";
import { itmsVendorMastRouter } from "../controller/itmsVendorMast";
import { vendorCommTranRouter } from "../controller/vendorCommTran";
import { officeMastRouter } from "../controller/itmsOfficeMast";
import { objectMastRouter } from "../controller/objectMast";
import { fVCBillTranRouter } from "../controller/ITMS-API/fVCBillTran";
import { employeeMastRouter } from "../controller/itmsEmployeeMast";

// SSO Login
import { ssoLoginRouter } from "../controller/ssologin";
import { ssoLoginFrontRouter } from "../controller/ssologinfrontend";

import { testRouter } from "../controller/test";
import { salaryTranLoadSummRouter } from "../controller/ITMS-API/salaryTranLoadSumm";
import { ssoAppLoginRouter } from "../controller/ssoAppLogin";
import { getEmpDetailRouter } from "../controller/getEmpDetails";
import { fVCBillTranOldRouter } from "../controller/fVCBillTranOld";
import { myIncomeRouter } from "../controller/ITMS-API/emplyeeTransaction";
import { singleIncomeRecRouter } from "../controller/ITMS-API/emplyeeSingleTranRec";
import { reqTranDetailsRouter } from "../controller/ITMS-API/reqTranDetails";
import { singleReqTranDetailsRouter } from "../controller/ITMS-API/singleReqTran";
import { reqApprovalDetailsRouter } from "../controller/ITMS-API/reqApprovalDetails";
import { form16DataRouter } from "../controller/ITMS-API/form16Data";
import { salAnnexBreakupRouter } from "../controller/ITMS-API/salaryAnnextureBreakup";
import { singleSalDetRouter } from "../controller/ITMS-API/singleSalaryDetails";
import { fVCBillTranMultiRouter } from "../controller/ITMS-API/fVCBillTranMulti";
import { pensionLoginRouter } from "../controller/pensionlogin";

const routes = Router();
routes.use('/', generateTokenRouter);
routes.use('/', fVCBillTranRouter); //1
routes.use('/', salaryBillTranRouter); //2
routes.use('/', employeeMastRouter); //3
routes.use('/', officeMastRouter); //4
routes.use('/', itmsVendorMastRouter); //5
routes.use('/', objectMastRouter); //6
routes.use('/', salaryAnnex2ADECLRouter); //7
routes.use('/', salaryAnnex2ApprovedRouter); //8
routes.use('/', vendorCommTranRouter); //9
routes.use('/', salaryTranLoadSummRouter); //10
routes.use('/', fVCBillTranMultiRouter); //11

// SSO login
routes.use('/', ssoLoginRouter);
routes.use('/', ssoLoginFrontRouter);
routes.use('/', getEmpDetailRouter);

routes.use('/', ssoAppLoginRouter);

routes.use('/', testRouter);
routes.use('/', fVCBillTranOldRouter);
routes.use('/', myIncomeRouter);
routes.use('/', singleIncomeRecRouter);
routes.use('/', salAnnexBreakupRouter);
routes.use('/', reqTranDetailsRouter);
routes.use('/', singleReqTranDetailsRouter);
routes.use('/', reqApprovalDetailsRouter);
routes.use('/', form16DataRouter);
routes.use('/', singleSalDetRouter);
routes.use('/', pensionLoginRouter);

export default routes;