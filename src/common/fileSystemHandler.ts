import { Blob } from 'buffer';
import fs from 'fs';
import fG from 'fast-glob';
import util from 'util';
import path from 'path';
const execAsync = util.promisify(require('child_process').exec);
import { AWS_BUCKETNAME, CLOUD_INFRA_AT, FORM_SIXTEEN, PUBLIC_BASE_PATH_F16 } from '../config/envConfig';
// import { FILEPATH_TEXT_IMPORT, FILEPATH_TEXT_IMPORT_WORKING_DIR, ORACLE_DB_IP } from '../config/envConfig';

// const { NodeSSH } = require('node-ssh');
// const ssh = new NodeSSH();

// const rootPath = `public/`;
const rootPath = ``;
const downloadPath = `public/download/folder`;

const promiseWrapper = (callback = ({ reject }: any): any => reject(false)) => {
    return new Promise<any>(async (resolve, reject) => {
        await callback({ resolve, reject });
    })
};

export const isRootPathExist = () => promiseWrapper(async ({ resolve, reject }) => {
    try {
        !fs.existsSync("public") && fs.mkdirSync('public', {
            recursive: true
        });
        resolve(true);
    } catch (e) {
        console.error(e);
        reject(false);
    }
})

export const isDownloadPathExist = () => promiseWrapper(async ({ resolve, reject }) => {
    try {
        !fs.existsSync("public/download") && fs.mkdirSync('public/download', {
            recursive: true
        });
        resolve(true);
    } catch (e) {
        console.error(e);
        reject(false);
    }
});

export const isFileExist = (path: any) => promiseWrapper(async ({ resolve, reject }) => {
    try {
        return resolve(await fs.existsSync(`public/${path}`));
    } catch (e) {
        console.error(e);
        return reject(false);
    }
})

export const fileStats = (path: any) => promiseWrapper(async ({ resolve, reject }) => {
    try {
        if (!isFileExist(path)) return resolve(false);
        return resolve(await fs.statSync(`public/${path}`));
    } catch (e) {
        console.error(e);
        return reject(false);
    }
})

export const renameFile = (from: string, to: string) => promiseWrapper(async ({ resolve, reject }) => {
    try {
        fs.renameSync(`${rootPath}${from}`, `${rootPath}${to}`);
        resolve(true);
    } catch (e) {
        console.error(e);
        reject(false);
    }
})

export const writeFile = (file: any, fileName: string) => promiseWrapper(async ({ resolve, reject }) => {
    try {
        if (await isRootPathExist()) fs.writeFileSync(`${rootPath}/${fileName}`, file, { encoding: 'base64' });
        resolve(true);
    } catch (e) {
        console.error(e);
        reject(false);
    }
})

export const writeFileAsync = (file: any, fileName: string, isDownloadPath = true) => promiseWrapper(async ({ resolve, reject }) => {
    try {
        if (await isDownloadPathExist()) fs.writeFileSync(`${isDownloadPath ? downloadPath : rootPath}/${fileName}`, file);
        resolve(true);
    } catch (e) {
        console.error(e);
        reject(false);
    }
})

export const appendFile = (file: any, fileName: string) => promiseWrapper(async ({ resolve, reject }) => {
    try {
        if (await isRootPathExist()) fs.appendFileSync(`${rootPath}${fileName}`, file, { encoding: 'base64' });
        resolve(true);
    } catch (e) {
        console.error(e);
        reject(false);
    }
})


export const removeFile = (fileName: string) => promiseWrapper(async ({ resolve, reject }) => {
    try {
        if (fs.existsSync(`public/${fileName}`)) fs.unlinkSync(`${rootPath}/${fileName}`);
        resolve(true);
    } catch (e) {
        console.error(e);
        reject(false);
    }
})

export const findFile = ({ fileExt = undefined, fileName = undefined, updatedFilePath = "", filePattern = undefined }: any = {}) => promiseWrapper(async ({ resolve, reject }) => {
    try {
        filePattern = filePattern ?? `${updatedFilePath}**/${fileName || "*"}*${fileExt ? `.${fileExt}` : ".*"}`;
        console.log(filePattern, "filePattern");
        let res: any;
        if (CLOUD_INFRA_AT == "AWS") {
            console.log(PUBLIC_BASE_PATH_F16);

            const rcloneCmd = `${filePattern}`?.replace(PUBLIC_BASE_PATH_F16, `rclone ls "S3:/${AWS_BUCKETNAME}/`).split("/**/").map((e, i) => i ? `" --include="${e}"` : e).join("");
            console.log(rcloneCmd, "rcloneCmd");
            const { stdout, stderr } = await execAsync(rcloneCmd);
            res = stdout.split("\n").filter((e: any) => !!e.trim()).map((e: any) => rcloneCmd.split(`"`)[1] + '/' + e.trim().split(" ").pop());
        }
        else {

            res = await fG([`${filePattern}`], {
                dot: !!fileExt,
                cwd: updatedFilePath,
                caseSensitiveMatch: false,
                followSymbolicLinks: true,
                onlyFiles: true,
            });
        }
        resolve({ fileArr: res, updatedFilePath });
    } catch (e) {
        console.error(e);
        reject({});
    }
});

