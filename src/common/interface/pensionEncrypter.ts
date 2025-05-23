// import { readFileSync } from 'fs';
// import { publicEncrypt, privateDecrypt, createSign, createVerify, constants } from 'crypto';

// // Load keys
// const targetPublicKey = readFileSync('public.pem', 'utf8');
// const yourPrivateKey = readFileSync('SenderPrivate.pem', 'utf8');
// const yourPublicKey = readFileSync('SenderPublic.pem', 'utf8');
// const targetPrivateKey = readFileSync('private.pem', 'utf8');

// export function encryptWithPublicKey(data: string): string {
//     const buffer = Buffer.from(data, 'utf8');
//     const encrypted = publicEncrypt(
//         {
//             key: targetPublicKey,
//             padding: constants.RSA_PKCS1_OAEP_PADDING,
//         },
//         buffer
//     );
//     return encrypted.toString('base64');
// }

// export function signWithPrivateKey(data: string): string {
//     const signer = createSign('SHA256');
//     signer.update(data);
//     signer.end();
//     return signer.sign(yourPrivateKey, 'base64');
// }

// export function verifyWithPublicKey(data: object, signature: string): boolean {
//     const verifier = createVerify('SHA256');
//     verifier.update(JSON.stringify(data));
//     verifier.end();
//     return verifier.verify(yourPublicKey, signature, 'base64');
// }

// export function decryptWithPrivateKey(encryptedBase64: string): object {
//     const buffer = Buffer.from(encryptedBase64, 'base64');
//     const decrypted = privateDecrypt(
//         {
//             key: targetPrivateKey,
//             padding: constants.RSA_PKCS1_OAEP_PADDING,
//         },
//         buffer
//     );
//     return JSON.parse(decrypted.toString('utf8'));
// }



// const userdetails = {
//     ppono: "RJANCE12",
//     Accno: "1234"
// }

// const data1 = JSON.stringify(userdetails);

// // by pension team
// const encryptedData = encryptWithPublicKey(data1);
// const signature = signWithPrivateKey(data1);
// const encryptData = btoa(JSON.stringify({
//     encryptedData, signature
// }));

// // by itms team
// const decryptJson = JSON.parse(atob(encryptData));
// console.log(decryptJson);
// const decryptedPayload = decryptWithPrivateKey(decryptJson.encryptedData);

// const isVerified = verifyWithPublicKey(decryptedPayload, decryptJson.signature);
// if (!isVerified) {
//     throw new Error('❌ Signature verification failed!');
// }
// console.log(decryptedPayload, isVerified);