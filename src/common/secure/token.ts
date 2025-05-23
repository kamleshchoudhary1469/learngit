import { sign, verify } from 'jsonwebtoken';
import { JwtAuthData } from '../interface/jwt';
import dotenv from 'dotenv';
import { v4 } from "uuid";
import { decrypt } from "../../config/aesHashToken";

dotenv.config();
const accessSecret = process.env.ACCESS_TOKEN_SECRET ? process.env.ACCESS_TOKEN_SECRET : '';
const refreshSecret = process.env.REFRESH_TOKEN_SECRET ? process.env.REFRESH_TOKEN_SECRET : '';
const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY ? process.env.ACCESS_TOKEN_EXPIRY : '8h';
const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY ? process.env.REFRESH_TOKEN_EXPIRY : '12h';

export interface TokenObj {
    accessToken: string,
    refreshToken: string,
    secretkey: string
}

export interface TokenNsecretkey {
    accessToken: string,
    secretkey: string
}

export async function generateTokens(payload: JwtAuthData, expiresIn = "8h") {
    return new Promise<TokenObj>((resolve, reject) => {
        try {
            const token = {
                accessToken: sign(payload, accessSecret, { expiresIn }),
                refreshToken: sign(payload, refreshSecret, { expiresIn: expiresIn ?? refreshTokenExpiry }),
                secretkey: v4()
            }
            resolve(token);
        } catch (e) {
            console.error(e);
            reject(e);
        }
    })
}

export async function validateRefreshToken(receivedToken: string) {
    return new Promise<string>((resolve, reject) => {
        try {
            let refreshToken: any = receivedToken;
            refreshToken = decrypt(refreshToken);
            const token: any = verify(refreshToken, refreshSecret, (err: any, payload: any) => {
                if (err) return "";
                const newPayload: any = payload;
                if (newPayload.iat) delete newPayload.iat;
                if (newPayload.exp) delete newPayload.exp;
                return sign(newPayload, accessSecret, { expiresIn: accessTokenExpiry });
            });
            resolve(token);
        } catch (e) {
            console.error(e);
            reject(e);
        }
    })
}

export async function generateMerchantTokens(payload: any) {
    return new Promise<TokenNsecretkey>((resolve, reject) => {
        try {
            const token = {
                accessToken: sign(payload, accessSecret, { expiresIn: "3m" }),
                secretkey: v4()
            }

            resolve(token);
        } catch (e) {
            console.error(e);
            reject(e);
        }
    })
}