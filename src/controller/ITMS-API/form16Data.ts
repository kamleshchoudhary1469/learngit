import { Request, Response, Router } from 'express';
import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import sCode from '../../common/status-codes';
import { execute } from '../../config/db';
import { validationRequest } from '../../middlewares/validate-request';
import { sDataWriter } from '../../common/sDataWriter';
import { DEBUG_DB, FORM_SIXTEEN, REACT_APP_ENV, SEVEN_ZIP_PATH } from '../../config/envConfig';
import { DatabaseSideError } from '../../errors/database-side-error';
import validateSqlInjection from '../../middlewares/validateSqlInjection';
import { findFile } from '../../common/fileSystemHandler';
import fs, { existsSync } from "fs";
import axios from 'axios';
import { validateRequestBodyKeys } from '../../middlewares/validateReqBody';
const { ok, server_error, un_authorized } = sCode;
const util = require('util');
const { exec } = require('child_process');
const execAsync = util.promisify(exec);
const router = Router();

router.post('/get-form16',
    validationRequest,
    validateRequestBodyKeys(["emp_code", "requestid", "acc_year"]),
    [currentUser, requireAuth],
    validateSqlInjection,
    async (req: any, res: any) => {
        if (req?.currentUser !== undefined) {
            if (req?.currentUser?.itmsapi) {


                let { type = "pdf", filePath = "", zProc, basePath, emp_code, requestid, acc_year } = req.body;
                let { fromapp, homeorigin } = req.headers;

                const filePathValue = `${FORM_SIXTEEN}/$client_code$/$tds_type_code$/$default_acc_year$/Q$quarter_no$/PDF/`;

                const fileValue = {
                    "client_code": req?.currentUser?.client_code,
                    "tds_type_code": req?.currentUser?.default_tds_type_code,
                    "default_acc_year": acc_year ?? req?.currentUser?.default_acc_year,
                    "quarter_no": req?.currentUser?.default_quarter_no,
                }

                console.log(fileValue, 'fileValue')

                let fileName;

                const headers = {
                    ...[["Clientcode", "client_code"], ["Accyear", "default_acc_year"], ["Quater", "default_quarter_no"], ["Month", "default_tran_month"], ["Frommonth", "default_from_date"], ["Tomonth", "default_to_date"], ["Tdscode", "default_tds_type_code"], ["Modulecode", "default_module_type_code"], ["submodulecode", "default_sub_module_type_code"], ["homeorigin", "homeorigin"]].reduce((a: any, c: any) => {
                        a[c[0].toLowerCase()] = btoa(req?.currentUser?.[c[1]] ?? req?.headers?.[c[0]] ?? req?.headers?.[c[0].toLowerCase()] ?? "")
                        return a;
                    }, {})
                }

                const empData: any = await axios.post(`http://127.0.0.1:4000/get-single-ifsm-emp-mast`, {
                    login_id: emp_code
                }, {
                    headers: { ...headers, authorization: req.headers?.authorization, homeorigin: homeorigin ?? "/itms" }
                });

                const { data } = empData;
                fileName = data?.get_gmdt_ifms_emp_mast?.detail?.length && data?.get_gmdt_ifms_emp_mast?.detail?.[0]?.emp_panno;
                if (!fileName) throw new DatabaseSideError("Emplyopee PAN not available", 400);

                const replacePlaceholders = (filePathValue: any, fileValue: any) => {
                    let replacedPath = filePathValue;
                    for (const key in fileValue) {
                        if (fileValue.hasOwnProperty(key)) {
                            const placeholder = key;
                            const value = fileValue[key] || '';
                            replacedPath = replacedPath.replace(new RegExp(placeholder, 'g'), value);
                        }
                    }
                    replacedPath = replacedPath.replace(/\$/g, '');
                    replacedPath = replacedPath.replace(/\$/g, '/');
                    return replacedPath;
                };
                let updatedFilePath = `${replacePlaceholders(filePathValue, fileValue)}`;
                console.log(updatedFilePath, "updatedFilePath");
                let { fileArr } = await findFile({ fileExt: type, fileName: fileName, updatedFilePath });

                console.error(fileArr, "=======>fileArr<=======");
                let zipPath = updatedFilePath?.replace('**//', '')?.replace('**/', '');
                const zipDownload = `public/form16/${fileName}.zip`;
                console.log(zipDownload, "zipDownload");

                console.log(fileArr?.length && req?.headers?.homeorigin != "/emp", "checkit");
                if (fileArr?.length && req?.headers?.homeorigin != "/emp") {
                    console.log(zProc, "zProc");
                    if (zProc) {
                        try {
                            const linuxPath = `${FORM_SIXTEEN}/${fileName}.zip`
                            const zipIt = process.platform === 'win32'
                                ? `"${SEVEN_ZIP_PATH}" a "${zipDownload}" "${zipPath}${fileName}*.pdf" -r`
                                : `zip -r -j "${linuxPath}" ${zipPath}${fileName}*.pdf`;
                            console.log(zipIt, "EXEC7ZIP");
                            await execAsync(zipIt);
                            process.platform === 'win32' ? setTimeout(() => (existsSync(zipDownload)) && fs.rmSync(zipDownload, { recursive: true, force: true }), 30000) : setTimeout(() => (existsSync(linuxPath)) && fs.rmSync(linuxPath, { recursive: true, force: true }), 30000);
                        } catch (error) {
                            console.error('Error creating or deleting the zip file:', error);
                        }
                    }
                }
                console.log({ fileArr });
                if (!fileArr?.length) throw new DatabaseSideError("Form 16 not available", 400);

                const detail = [];
                for (let index = 0; index < fileArr.length; index++) {
                    const filePath = fileArr[index];
                    console.log(filePath, 'filePathfilePath')
                    const fileName = filePath.split("/").pop();
                    const employeePanMatch = fileName.match(/^[A-Z]{5}\d{4}[A-Z]/);
                    detail[index] = {
                        employee_pan: employeePanMatch ? employeePanMatch[0] : "UNKNOWN",
                        file_name: filePath.split("/").pop(),
                        file_type: "Form 16",
                        file_path: await fs.existsSync(filePath) && await fs.readFileSync(filePath, "base64")
                    };
                }
                // const detail = fileArr.map((filePath: any) => {
                // });
                // const header = [
                //     { field: "employee_pan" },
                //     { field: "file_name" },
                //     { field: "file_type" },
                //     { field: "file_path" }
                // ]
                return res.status(200).send({
                    status: "SUCCESS", code: "SUCCESS", message: "Download successfully.", requestid, data: {
                        detail
                    }
                });
            } else {
                return res.status(un_authorized).send({ status: "UN-Authorised", errdata: null, data: null, message: "You are not authorized to view the requested page." });
            }
        }
    }
);
export { router as form16DataRouter };