import express from 'express';

const router = express.Router();

const data = [
    {
        id: 1,
        name: '하남고',
    },
    {
        id: 2,
        name: '미사고',
    },
];

router.get('/', (req, res) => res.status(200).json(data));

router.get('/:schoolId', (req, res) => {//:이 있으면 path variable
    const { schoolId } = req.params;//디스트럭처링 schoolId = req.params.schoolId
    if (!schoolId) {
        return res.status(400).json();
    }

    const schoolIdNumber = parseInt(schoolId, 10);
    if (!data.some(({ id }) => id === schoolIdNumber)) {//some은 하나라도잇으면true
        return res.status(404).json();
    }
    const filtered = data.filter((item) => item.id === schoolIdNumber);
    return res.status(200).json(filtered[0]);
})

export default router;