import * as trpcNext from '@trpc/server/adapters/next';
import { createContext } from '../../../server/context';
import { appRouter } from '../../../server/routers';

// export API handler
export default trpcNext.createNextApiHandler({
    router: appRouter,
    createContext: createContext,
    // batching: {
    //     enabled: false
    // },
    // responseMeta({ ctx, paths, type, errors }) {
    //     // assuming you have all your public routes with the keyword `public` in them
    //     //   const allPublic =
    //     //     paths && paths.every((path) => path.includes('public'));
    //     // checking that no procedures errored
    //     const allOk = errors.length === 0;
    //     // checking we're doing a query request
    //     const isQuery = type === 'query';

    //     if (ctx?.res && allOk && isQuery) {
    //         // cache request for 1 day + revalidate once every second
    //         const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
    //         return {
    //             // headers: {
    //             //     'cache-control': `s-maxage=1, stale-while-revalidate=${60}`,
    //             // },
    //         };
    //     }
    //     return {

    //     };
    // },
});

export const config = {
    api: {
        responseLimit: false,
    },
}