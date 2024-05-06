const JSZip = require('jszip');
const fs = require('fs');
const https = require('https');

class ModJSON {
    constructor() {
        this.versions = {};
    }

    static getCurrentMods() {
        const r = new ModJSON();
        const c = new https.Agent();
        https.get('https://computerelite.github.io/tools/Beat_Saber/mods.json', (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                r.versions = JSON.parse(data);
            });
        });
        return r;
    }

    addMod(downloadLink) {
        if (!downloadLink.includes('github.com')) return;
        const client = new https.Agent();
        try {
            client.setHeader('authorization', fs.readFileSync('token.txt', 'utf8'));
            client.setHeader('User-Agent', 'ModUpdater/0.1');
            if (!downloadLink.endsWith('.qmod')) return;
            console.log('Downloading from ' + downloadLink);
            if (fs.existsSync('mod.qmod')) fs.unlinkSync('mod.qmod');
            https.get(downloadLink, (res) => {
                const file = fs.createWriteStream('mod.qmod');
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    const f = new JSZip();
                    fs.readFile('mod.qmod', (err, data) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        f.loadAsync(data).then(() => {
                            f.file('mod.json').async('string').then((content) => {
                                const mod = JSON.parse(content);
                                // Rest of the code...
                            }).catch((err) => {
                                console.log(err);
                            });
                        }).catch((err) => {
                            console.log(err);
                        });
                    });
                    const j = new ModJSONMod();
                    j.name = mod.Name;
                    j.description = mod.Description;
                    j.author = mod.Author + ', ' + mod.Porter;
                    if (j.author.endsWith(', ')) j.author = j.author.substring(0, j.author.length - 2);
                    j.version = mod.Version.toString();
                    j.id = mod.Id;
                    j.modloader = mod.ModLoader.toString();
                    j.download = downloadLink;
                    j.source = downloadLink.substring(0, downloadLink.indexOf('releases'));
                    let gameVersion = mod.PackageVersion;
                    if (gameVersion === null) gameVersion = 'undefined';
                    if (!this.versions.hasOwnProperty(gameVersion)) this.versions[gameVersion] = [];
                    let found = false;
                    for (let i = 0; i < this.versions[gameVersion].length; i++) {
                        if (this.versions[gameVersion][i].cover === null && this.versions[gameVersion][i].id === j.id && this.versions[gameVersion][i].source.toLowerCase().includes('github.com')) {
                            console.log('Getting cover url for mod ' + j.name + ' - ' + j.version + ' for ' + gameVersion);
                            this.versions[gameVersion][i].cover = this.getCoverUrl(this.versions[gameVersion][i], mod.CoverImagePath);
                            if (this.versions[gameVersion][i].cover === '') {
                                console.log('\x1b[31mCover not found\x1b[0m');
                            } else {
                                console.log('\x1b[32mCover found at ' + this.versions[gameVersion][i].cover + '\x1b[0m');
                            }
                            console.log('Updated entry of mod with cover');
                        }
                        if (this.versions[gameVersion][i].download === j.download && !found) {
                            mod.dispose();
                            f.dispose();
                            if (fs.existsSync('mod.qmod')) fs.unlinkSync('mod.qmod');
                            found = true;
                        }
                    }
                    if (found) return;
                    console.log('Getting cover url for mod ' + j.name + ' - ' + j.version + ' for ' + gameVersion);
                    j.cover = this.getCoverUrl(j, mod.CoverImagePath);
                    if (j.cover === '') {
                        console.log('\x1b[31mCover not found\x1b[0m');
                    } else {
                        console.log('\x1b[32mCover found at ' + j.cover + '\x1b[0m');
                    }
                    console.log('Added mod ' + j.name + ' - ' + j.version + ' for ' + gameVersion + ' to list.');
                    mod.dispose();
                    f.dispose();
                    if (fs.existsSync('mod.qmod')) fs.unlinkSync('mod.qmod');
                    this.versions[gameVersion].push(j);
                });
            });
        } catch (e) {
            client.dispose();
            console.log('failed: ' + e.toString());
        }
    }

    getCoverUrl(modJsonMod, coverFileName) {
        if (coverFileName === '') return '';
        const rawLink = 'https://raw.githubusercontent.com/' + modJsonMod.source.split('/')[3] + '/' + modJsonMod.source.split('/')[4] + '/';
        console.log(rawLink + 'master/' + coverFileName);
        if (this.doesUrlExist(rawLink + 'master/' + coverFileName)) return rawLink + 'master/' + coverFileName;
        if (this.doesUrlExist(rawLink + 'main/' + coverFileName)) return rawLink + 'main/' + coverFileName;
        return '';
    }

    doesUrlExist(url) {
        try {
            const request = https.request(url, { method: 'HEAD' });
            request.setHeader('authorization', fs.readFileSync('token.txt', 'utf8'));
            request.setHeader('User-Agent', 'ModUpdater/0.1');
            request.end();
            request.on('response', (res) => {
                return res.statusCode === 200;
            });
        } catch (e) {
            console.log(e.toString());
            return false;
        }
    }
}

class ModJSONMod {
    constructor() {
        this.name = '';
        this.description = '';
        this.id = '';
        this.version = '';
        this.download = '';
        this.source = '';
        this.author = '';
        this.cover = null;
        this.modloader = QuestPatcher.ModLoader.QuestLoader.toString();
    }
}