// eslint-disable-next-line @typescript-eslint/no-var-requires
const CryptoJS = require('crypto-js');

const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';

/**
 * 采用 `AES` 加密算法对文本 `textToEncrypt` 进行加密
 * @param textToEncrypt 需要加密的文本
 * @returns 经过加密的文本
 */
export const encryptText = (textToEncrypt: string) =>
  CryptoJS.AES.encrypt(textToEncrypt, secretKey).toString();

/**
 * 解密经过 `AES` 加密算法加密的文本 `textToDecrypt`
 * @param textToDecrypt 需要解密的文本
 * @returns 经过解密的文本
 */
export const decryptText = (textToDecrypt: string) =>
  CryptoJS.AES.decrypt(textToDecrypt, secretKey).toString(CryptoJS.enc.Utf8);
