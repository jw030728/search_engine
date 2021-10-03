import express from 'express';
import { KMR } from "koalanlp/API";
import { Tagger } from "koalanlp/proc";

const router = express.Router();

router.get('/', async (req, res) => {// query string으로 들어옴 pathvariable말고
    const { q } = req.query;//디스트럭처링 쿼리파라미터 불러올때 query에서

    if (!q) {
        return res.status(400).json();
    }

    const tagger = new Tagger(KMR);
    const tagged = await tagger(q);
    const searchKeywords: Set<string> = new Set();

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

    return res.status(200).json(q);
});

export default router;