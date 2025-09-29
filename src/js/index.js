import 'main.css';

import Decrypter from 'Decrypter.js';
import Parser from 'Parser.js';
import Exporter from 'Exporter.js';
import { Relics, Effects } from 'RelicMaster.js';
import { values } from 'i18n.js';

class App {
    constructor() {
        const inputSave = document.querySelector('#input-save');
        inputSave.addEventListener('change', async (e) => {
            const files = e.target.files;

            if (files.length < 1) {
                return;
            }

            this.onFileOpen(files[0]);
        });

        this._tableCharacters = document.querySelector('#table-characters');
        this._tableRelics = document.querySelector('#table-relics');
        this._exporter = new Exporter();
        this._currentData = null;

        this._locale = 'ja';
    }

    async onFileOpen(file) {
        const buffer = await file.arrayBuffer();
        this.parseSaveData(buffer);
    }

    async parseSaveData(buffer) {
        const decrypter = new Decrypter();
        const entries = await decrypter.decrypt(buffer);

        if (entries.length != 14) {
            console.warn('Invalid entries. Nightreign save data must have exact 14 entries.');
            return;
        }

        const parser = new Parser(entries);
        this._currentData = parser.parse();

        this.updateCharactersTable();
    }

    updateCharactersTable() {
        while (this._tableCharacters.children.length > 0) {
            this._tableCharacters.removeChild(this._tableCharacters.firstChild);
        }

        for (const [index, playerData] of this._currentData.entries()) {
            const tr = document.createElement('tr');

            const tdName = document.createElement('td');
            tdName.classList.add('name');
            tdName.textContent = playerData.name;
            tr.appendChild(tdName);

            const tdBrowse = document.createElement('td');
            const buttonBrowse = document.createElement('button');
            buttonBrowse.textContent = 'Browse';
            buttonBrowse.addEventListener('click', (e) => {
                this.browse(index);
            });
            tdBrowse.appendChild(buttonBrowse);
            tr.appendChild(tdBrowse);

            const tdExport = document.createElement('td');
            const buttonExport = document.createElement('button');
            buttonExport.textContent = 'Export CSV';
            buttonExport.addEventListener('click', (e) => {
                this.exportCsv(index);
            });
            tdExport.appendChild(buttonExport);
            tr.appendChild(tdExport);

            this._tableCharacters.appendChild(tr);
        }
    }

    exportCsv(index) {
        const csv = this._exporter.toCsv(this._currentData[index], this._locale);

        const blob = new Blob([csv], { type: 'text/plain' });

        const a = document.createElement('a');
        document.body.appendChild(a);
        a.href = window.URL.createObjectURL(blob);
        a.download = 'relics.csv';
        a.click();
        document.body.removeChild(a);
    }

    browse(index) {
        while (this._tableRelics.children.length > 0) {
            this._tableRelics.removeChild(this._tableRelics.firstChild);
        }

        const effectCount = 3;
        const tbody = document.createElement('tbody');

        const res = values[this._locale];

        for (const [i, relic] of this._currentData[index].relics.entries()) {
            const relicMaster = Relics[relic.itemId];

            const tr = document.createElement('tr');

            const tdColor = document.createElement('td');
            tdColor.classList.add('color');
            tdColor.classList.add(relicMaster.color);
            tdColor.classList.add(relicMaster.type);
            tr.appendChild(tdColor);

            for (let i = 0; i < effectCount; i++) {
                const td = document.createElement('td');

                const divEffect = document.createElement('div');
                const divCursedEffect = document.createElement('div');
                divEffect.classList.add('effect');
                divCursedEffect.classList.add('cursed-effect');

                const effectId = relic.effectIds[i];
                const cursedEffectId = relic.cursedEffectIds[i];

                if (effectId > 0) {
                    const effectMaster = Effects[effectId];
                    const effectName = res[effectMaster.name] !== undefined ? res[effectMaster.name] : effectMaster.name;
                    divEffect.textContent = effectName;
                }
                td.appendChild(divEffect);

                if (cursedEffectId > 0) {
                    const effectMaster = Effects[cursedEffectId];
                    const effectName = res[effectMaster.name] !== undefined ? res[effectMaster.name] : effectMaster.name;
                    divCursedEffect.textContent = effectName;
                }
                td.appendChild(divCursedEffect);

                tr.appendChild(td);
            }

            tbody.appendChild(tr);
        }

        this._tableRelics.appendChild(tbody);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});
