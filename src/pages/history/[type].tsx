import * as React from 'react';
import { useRouter } from 'next/router';
import HistoryLayout, { HistoryType } from 'src/layouts/HistoryLayout';

const HistoryPage = () => {
    const router = useRouter()
    const { type } = router.query;

    const getHistoryType = (): HistoryType => {

        if (type === 'likes') {
            return 'liked';
        } else if (type === 'later') {
            return 'readLater';
        }

        return 'favorited';
    }


    return (
        <HistoryLayout historyType={getHistoryType()} />
    )
}

export default HistoryPage;