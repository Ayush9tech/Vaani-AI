import {readdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const target=process.argv[2]||'dist/client';
async function walk(dir,prefix=''){const result=[];for(const entry of await readdir(dir,{withFileTypes:true})){const name=path.posix.join(prefix,entry.name);if(entry.isDirectory())result.push(...await walk(path.join(dir,entry.name),name));else if(/\.(js|css)$/.test(name)&&(name.startsWith('assets/')||name.startsWith('_next/static/')||name.startsWith('static/'))&&!/(^|\/)pdf[-.]/.test(name))result.push(name.startsWith('static/')?'/_next/'+name:'/'+name);}return result;}
const assets=await walk(target);await writeFile(path.join(target,'precache-manifest.js'),`self.__VAANI_PRECACHE__=${JSON.stringify(assets)};\n`);console.log(`Offline shell: ${assets.length} assets prepared.`);
