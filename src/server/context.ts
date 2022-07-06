/* eslint-disable @typescript-eslint/no-unused-vars */
import * as trpc from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import { prisma } from './prisma';
import { appRouter } from './routers';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CreateContextOptions {
    // session: Session | null
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock Next.js' request/response
 */
// export async function createContextInner(_opts: CreateContextOptions) {
//     return {};
// }


/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export async function createContext({
    req,
    res,
}: trpcNext.CreateNextContextOptions,
) {
    // for API-response caching see https://trpc.io/docs/caching

    return {
        req,
        res,
        prisma,
    };
}

export type Context = trpc.inferAsyncReturnType<typeof createContext>;

export default trpcNext.createNextApiHandler({
    router: appRouter,
    createContext,
    responseMeta({ ctx, paths, type, errors }) {
        // assuming you have all your public routes with the keyword `public` in them
        //   const allPublic =
        //     paths && paths.every((path) => path.includes('public'));
        // checking that no procedures errored
        const allOk = errors.length === 0;
        // checking we're doing a query request
        const isQuery = type === 'query';

        // if (ctx?.res && allOk && isQuery) {
        //     // cache request for 1 day + revalidate once every second
        //     const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
        //     return {
        //         headers: {
        //             'cache-control': `s-maxage=1, stale-while-revalidate=${60}`,
        //         },
        //     };
        // }
        return {
            headers: { 'access-control-allow-origin': '*' },
        };
    },
});