import { DEBUG_DB } from "./envConfig";
import axios from "axios";

export const execute = async (query: string, sdata: any, procType: any, req: any = null, exucutionType: any = null) => {
    if (DEBUG_DB) req.DEBUG_DB = { query, sdata: JSON.parse(sdata), procType, exucutionType };
    try {
        const headers = {
            ...[["Clientcode","client_code"], ["Accyear","default_acc_year"], ["Quater","default_quarter_no"], ["Month","default_tran_month"], ["Frommonth","default_from_date"], ["Tomonth","default_to_date"], ["Tdscode","default_tds_type_code"], ["Modulecode","default_module_type_code"], ["submodulecode","default_sub_module_type_code"], ["homeorigin","homeorigin"]].reduce((a: any, c: any) => {
                a[c[0].toLowerCase()] = req?.currentUser?.[c[1]] ?? req?.headers?.[c[0]] ?? req?.headers?.[c[0].toLowerCase()] ?? ""
                return a;
            }, {})
        }
        const res: any = await axios.post(`http://127.0.0.1:4025/dbCall`, {
            query,
            sdata,
            procType,
            exucutionType
        }, {
            headers
        });
        const { data } = res;
        return exucutionType == "queryexecute" ? (data[0] ? data[0] : data) : { ...data, data: data[procType] };
    } catch (error) {
        const { data } = error?.response;
        return data ?? {}
    }
};