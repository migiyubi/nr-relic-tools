import BinaryUtils from 'BinaryUtils.js';

export default class Parser {
    constructor(entries) {
        this._entries = entries;
        this._nameDecoder = new TextDecoder('utf-16le');
    }

    static get B3_PATTERNS() { return new Set([0x80, 0x83, 0x81, 0x82, 0x84, 0x85]); }
    static get B4_PATTERNS() { return new Set([0x80, 0x90, 0xc0]); }
    static get EMPTY_SLOT_PATTERN() { return new Uint8Array([0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff]); }

    parse() {
        const ret = [];
        const nameBytes = this.parseCharacterNameBytes();

        for (let i = 0; i < nameBytes.length; i++) {
            ret.push(this.parseCharacter(this._entries[i], nameBytes[i]));
        }

        return ret;
    }

    parseCharacter(entry, nameByte) {
        const end = BinaryUtils.findBytePattern(entry, nameByte, 0) - 100;

        if (end < 0) {
            console.warn('Character name not found in the entry.');
            return null;
        }

        const relics = this.parseRelics(entry, 32, end);
        const name = this._nameDecoder.decode(nameByte);

        return { name, relics };
    }

    parseRelics(entry, start, end) {
        const ret = [];
        const src = entry.slice(start, end);

        let i = 0;

        while (i < src.length - 4) {
            const b3 = src[i+2];
            const b4 = src[i+3];

            if (Parser.B3_PATTERNS.has(b3) && Parser.B4_PATTERNS.has(b4)) {
                const size = b4 == 0xc0 ? 72 : b4 == 0x90 ? 16 : 80;

                if (b4 == 0xc0) {
                    const sortKeyByte = [src[i], src[i+1], src[i+2], src[i+3], 1, 0, 0, 0];
                    const sortKeyOffset = BinaryUtils.findBytePattern(entry, sortKeyByte, end);

                    if (sortKeyOffset >= 0) {
                        const id = BinaryUtils.extractI32(src, i);
                        const itemId = BinaryUtils.extractI24(src, i+4);
                        const effectIds = [
                            BinaryUtils.extractI32(src, i+16),
                            BinaryUtils.extractI32(src, i+20),
                            BinaryUtils.extractI32(src, i+24)
                        ];
                        const cursedEffectIds = [
                            BinaryUtils.extractI32(src, i+56),
                            BinaryUtils.extractI32(src, i+60),
                            BinaryUtils.extractI32(src, i+64)
                        ];

                        ret.push({ id, itemId, effectIds, cursedEffectIds });
                    }
                }

                i += size;
            }
            else if (BinaryUtils.equals(Parser.EMPTY_SLOT_PATTERN, src.slice(i, i+8))) {
                i += 8;
            }
            else {
                i += 1;
            }
        }

        return ret;
    }

    parseCharacterNameBytes() {
        const entry = this._entries[10];
        const ret = [];
        let offset = 0;

        while (true) {
            const start = BinaryUtils.findBytePattern(entry, [39,0,0,70,65,67,69], offset) - 51;

            if (start < 0) {
                break;
            }

            const end = BinaryUtils.findBytePattern(entry, [0,0], start) + 1;
            ret.push(entry.slice(start, end));

            offset = start + 58;
        }

        return ret;
    }
}
