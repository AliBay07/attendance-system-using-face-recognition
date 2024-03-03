import CryptoJS from 'crypto-js';

const key = CryptoJS.enc.Hex.parse('4edebe2016d827fbad402a868b88bfc3089e91e029f2bc1cf9f1025b368b7390');
const iv = CryptoJS.enc.Hex.parse('08f6da05733521d67e15cc8902101035');

function decrypt(encryptedData) {
    if (encryptedData == null) {
        return null
    }
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, key, { iv });
    const decrypted = decryptedBytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
}

export { decrypt };




