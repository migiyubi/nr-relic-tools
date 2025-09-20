import { Relics, Effects } from 'RelicMaster.js';
import { values } from 'i18n.js';

export default class Exporter {
    constructor() {}

    toCsv(data, lang='en') {
        const res = values[lang];
        let csv = 'id,color,effect1,effect2,effect3,cursedEffect1,cursedEffect2,cursedEffect3\n';

        for (const [index, relic] of data.relics.entries()) {
            let line = `${index+1}`;

            const relicMaster = Relics[relic.itemId];
            if (relicMaster === undefined) {
                console.warn(`Unknown relic id. : ${relic.itemId}`);
                continue;
            }

            const color = res[relicMaster.color] !== undefined ? res[relicMaster.color] : relicMaster.color;
            line += `,${color}`;

            for (const id of relic.effectIds) {
                if (id < 0) {
                    line += ',';
                }
                else {
                    const effectMaster = Effects[id];
                    if (effectMaster === undefined) {
                        console.warn(`Unknown effect id. : ${id}`);
                        line += ',';
                    }
                    else {
                        const effect = res[effectMaster.name] !== undefined ? res[effectMaster.name] : effectMaster.name;
                        line += `,${effect}`;
                    }
                }
            }

            for (const id of relic.cursedEffectIds) {
                if (id < 0) {
                    line += ',';
                }
                else {
                    const effectMaster = Effects[id];
                    if (effectMaster === undefined) {
                        console.warn(`Unknown effect id. : ${id}`);
                        line += ',';
                    }
                    else {
                        const effect = res[effectMaster.name] !== undefined ? res[effectMaster.name] : effectMaster.name;
                        line += `,${effect}`;
                    }
                }
            }

            line += '\n';
            csv += line;
        }

        return csv;
    }
}
