import express, { urlencoded } from 'express';
import { KMR } from "koalanlp/API";
import { Tagger } from "koalanlp/proc";
import { Op } from 'sequelize';
import { Keyword } from '../models/Keyword';
import { KeywordLink } from '../models/KeywordLink';
import { Link } from '../models/Link';

const router = express.Router();

type FrequentLink = {
    url: string; //link
    content: string; //description
    count: number;
}

router.get('/', async (req, res) => {// query string으로 들어옴 pathvariable말고
    const { q } = req.query;//디스트럭처링 쿼리파라미터 불러올때 query에서

    if (!q) {
        return res.status(400).json();
    }

    const tagger = new Tagger(KMR);
    const tagged = await tagger(q);
    const searchKeywords: Set<string> = new Set();//사용자가 보낸키워드

    //g형태소분석
    for (const sent of tagged) {
        for (const word of sent._items) {
            for (const morpheme of word._items) {
                const t = morpheme._tag;
                //nng 명사 등.. 찾기
                if (t === "NNG" || t === "NNP" || t === "NNB" ||
                    t === "NP" || t === "NR" || t === "VV" || t === "SL") {
                    const keyword = morpheme._surface.toLowerCase();
                    searchKeywords.add(keyword);
                }
            }
        }
    }

    //키워드에 link잇는걸 찾을것  keywords에 값 담아두기
    const keywords = await Keyword.findAll({
        where: {
            name: {
                [Op.in]: Array.from(searchKeywords.values())//searchkeywords배열로 바꿔서 리턴
            }
        },
        include: [Link]
    });

    const frequentLink = new Map<string, FrequentLink>();

    keywords.forEach((keyword) => {
        keyword.links.forEach((link) => {
            const exist = frequentLink.get(link.url);//있는지없는지
            if (exist) {
                exist.count += 1;
                frequentLink.set(link.url, exist);
            }
            else {
                frequentLink.set(link.url, {
                    url: link.url,
                    content: link.description,
                    count: 1,
                });
            }
        });
    });

    const result = Array.from(frequentLink.values()).sort(
        (link1, link2) => link2.count - link1.count
    );

    return res.status(200).json(result);
});

export default router;