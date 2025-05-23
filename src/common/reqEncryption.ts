import { dbConfigParms } from '../config/dbconfig';
import { DEBUG_DB } from '../config/envConfig';
import { payloadDecrypter, payloadEncrypter } from './interface/chunkDecrypter';

export const reqEncryt = async (req: any, res: any, next: any) => {
    const isEncrypted = !!(req?.body?.encryptedValue && req?.body?.rsaEncryptedHashed && (!(req?.url?.includes('file-upload')) || !(req?.url?.includes('generate-token'))));

    if (isEncrypted) req.body = req.body = await payloadDecrypter(req?.body);

    const originalSend = res.send;
    res.send = async function (data: any) {
        if (!(req?.url?.includes('generate-token'))) {
            data = { ...data, ...(DEBUG_DB ? { dbConfigParms: await dbConfigParms(req?.headers?.homeorigin, req?.currentUser?.default_acc_year, req?.currentUser?.default_sub_module_type_code), DEBUG_DB: req.DEBUG_DB ?? {} } : {}) };
        }
        if (isEncrypted) data = await payloadEncrypter(JSON.stringify(data));
        res.send = originalSend
        return res.send(data)
    }
    next();
}