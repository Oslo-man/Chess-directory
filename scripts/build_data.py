import csv, json
from pathlib import Path

SRC=Path('/mnt/data/chess-directory/data/sites-source.csv')
OUT=Path('/mnt/data/chess-directory/data/sites.json')

failed={
'https://www.chessvariants.com',
'https://chessbook.com',
'https://www.openingtree.com',
'https://darksquares.net',
'https://www.chessfactor.com',
'https://www.chessable.com',
'https://www.everymanchess.com',
'https://thinkerspublishing.com',
'https://forwardchess.com',
'https://www.chesscademy.com',
'https://www.chesscheckup.com',
'https://new.uschess.org',
'https://www.sjakk.no',
'https://sachy.sk',
'https://sah.hr',
'https://www.sah-zveza.si',
'https://frchess.ro',
'https://www.chess.bg',
'https://chessfed.lt',
'https://sahsrbija.rs',
'https://gcf.org.ge',
'https://azerichess.az',
'https://www.cca.net.cn',
'https://jca-chess.com',
'https://www.kchess.or.kr',
'https://www.singaporechess.org.sg',
'https://www.ncfp.ph',
'https://thaichess.com',
'https://chessfed.lk',
'https://pcfchess.org',
'https://uaechess.ae',
'https://www.qatarchess.com',
'https://www.arasanchess.org',
'https://komodochess.com',
'https://www.fritzchess.com',
'https://www.gnu.org/software/chess/',
'https://computerchess.org.uk',
'https://www.cegt.net',
'https://banksiagui.com',
'https://www.playwitharena.de',
'https://talkchess.com',
'https://www.chess.co.uk',
'https://www.thechessstore.com',
'https://www.bestchessset.com',
'https://www.chessmegastore.com',
'https://2700chess.com',
'https://www.chessmetrics.com',
'https://www.chesshistory.com/winter/',
'https://liquipedia.net/chess/',
}
rows=[]; seen=set()
with SRC.open(encoding='utf-8', newline='') as f:
    for row in csv.reader(f):
        if not row or row[0]=='name': continue
        if len(row)<5: continue
        name,url,cats=row[0],row[1],row[2]
        desc=','.join(row[3:-1]).strip()
        source=row[-1].strip()
        if not url or url in failed: continue
        key=url.rstrip('/')
        if key in seen: continue
        seen.add(key)
        rows.append({
            'id': f'site-{len(rows)+1:03d}',
            'name': name.strip(),
            'url': url.strip(),
            'categories': [c.strip() for c in cats.split('|') if c.strip()],
            'description': desc,
            'source': source,
            'verification': 'Current source listing plus live-link spot check'
        })
OUT.write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
print('count',len(rows),'unique urls',len({r['url'].rstrip('/') for r in rows}))
