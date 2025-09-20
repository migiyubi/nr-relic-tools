export default class BinaryUtils {
    constructor() {}

    static findBytePattern(src, pattern, offset) {
        for (let i = offset; i < src.length - pattern.length + 1; i++) {
            let match = true;

            for (let j = 0; j < pattern.length; j++) {
                if (src[i+j] != pattern[j]) {
                    match = false;
                    break;
                }
            }

            if (match) {
                return i;
            }
        }

        return -1;
    }

    static equals(buffer1, buffer2, length=buffer1.length) {
        for (let i = 0; i < length; i++) {
            if (buffer1[i] != buffer2[i]) {
                return false;
            }
        }

        return true;
    }

    static extractI32(src, offset) {
        return src[offset] | src[offset+1] << 8 | src[offset+2] << 16 | src[offset+3] << 24;
    }

    static extractI24(src, offset) {
        return src[offset] | src[offset+1] << 8 | src[offset+2] << 16;
    }
}
