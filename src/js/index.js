import 'main.css';

import Decrypter from 'Decrypter.js';
import Parser from 'Parser.js';
import Exporter from 'Exporter.js';

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
        this._exporter = new Exporter();
        this._currentData = null;
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

        this.updateTable();
    }

    updateTable() {
        while (this._tableCharacters.children.length > 0) {
            this._tableCharacters.removeChild(this._tableCharacters.firstChild);
        }

        for (const [index, playerData] of this._currentData.entries()) {
            const tr = document.createElement('tr');

            const tdName = document.createElement('td');
            tdName.classList.add('name');
            tdName.textContent = playerData.name;
            tr.appendChild(tdName);

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
        const csv = this._exporter.toCsv(this._currentData[index], 'ja');

        const blob = new Blob([csv], { type: 'text/plain' });

        const a = document.createElement('a');
        document.body.appendChild(a);
        a.href = window.URL.createObjectURL(blob);
        a.download = 'relics.csv';
        a.click();
        document.body.removeChild(a);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});
