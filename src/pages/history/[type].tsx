import * as React from 'react';
import { useRouter } from 'next/router';
import HistoryLayout, { HistoryType } from 'src/layouts/HistoryLayout';

const HistoryPage = () => {
    const router = useRouter()
    const { type } = router.query;

    const [historyType, setHistoryType] = React.useState<HistoryType>('favorited');

    const getHistoryType = (): HistoryType => {

        if (type === 'likes') {
            return 'liked';
        } else if (type === 'later') {
            return 'readLater';
        }

        return 'favorited';
    }

    React.useEffect(() => {
        setHistoryType(getHistoryType());
    }, [type])


    return (
        <HistoryLayout historyType={historyType} />
    )
}

export default HistoryPage;