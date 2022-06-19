import * as trpc from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import { z } from 'zod';
import { appRouter } from '/@/server/routers';
import { createContext } from '../../../src/server/context';

// export API handler
export default trpcNext.createNextApiHandler({
    router: appRouter,
    createContext: createContext,
});