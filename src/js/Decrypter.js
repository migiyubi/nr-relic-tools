import BinaryUtils from 'BinaryUtils.js';

export default class Decrypter {
    constructor() {}

    static get BND4_HEADER_SIZE() { return 64; }
    static get BND4_ENTRY_HEADER_SIZE() { return 32; }
    static get BND4_HEADER_MAGIC() { return new Uint8Array([0x42, 0x4e, 0x44, 0x34]); }
    static get BND4_ENTRY_HEADER_MAGIC() { return new Uint8Array([0x40, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff]); }
    static get IV_SIZE() { return 16; }
    static get NR_KEY() { return new Uint8Array([0x18, 0xf6, 0x32, 0x66, 0x05, 0xbd, 0x17, 0x8a, 0x55, 0x24, 0x52, 0x3a, 0xc0, 0xa0, 0xc6, 0x09]); }

    async decrypt(buffer) {
        const src = new Uint8Array(buffer);

        if (!BinaryUtils.equals(Decrypter.BND4_HEADER_MAGIC, src)) {
            console.warn('Not a BND4 file.');
            return null;
        }

        const entryCount = BinaryUtils.extractI32(src, 12);
        let offset = Decrypter.BND4_HEADER_SIZE;

        const ret = [];

        for (let i = 0; i < entryCount; i++) {
            const header = src.slice(offset, offset + Decrypter.BND4_ENTRY_HEADER_SIZE);

            if (!BinaryUtils.equals(Decrypter.BND4_ENTRY_HEADER_MAGIC, header)) {
                console.warn('Invalid entry header.');
                return null;
            }

            const size = BinaryUtils.extractI32(header, 8);
            const dataOffset = BinaryUtils.extractI32(header, 16);

            const encryptedData = src.slice(dataOffset, dataOffset + size);
            const iv = encryptedData.slice(0, Decrypter.IV_SIZE);
            const encryptedPayload = encryptedData.slice(Decrypter.IV_SIZE);

            const entry = await this.decryptAES(
                Decrypter.NR_KEY,
                iv,
                encryptedPayload
            );
            ret.push(entry.slice(4));

            offset += Decrypter.BND4_ENTRY_HEADER_SIZE;
        }

        return ret;
    }

    async decryptAES(key, iv, data) {
        const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'AES-CBC' }, false, ['decrypt']);
        const decrypted = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, cryptoKey, data);

        return new Uint8Array(decrypted);
    }
}
