import * as React from 'react';
import { StatusTypeSort } from 'src/components/MobileSelect/TypeSelect';
import { Prompt, IStory } from 'src/interfaces/db';
import { trpc } from 'src/utils/trpc';
import { useUser } from './useUser';

interface Options {
    statusToGet: "liked" | "readLater" | "favorited",
    filter: StatusTypeSort
}

export const useUserSavedQuery = ({ filter, statusToGet }: Options) => {
    const { userId, isAuthenticated } = useUser();

    const isStory = (object: any): object is IStory => {
        return "mainCommentId" in object;
    }

    return trpc.useQuery(['user.getLikes', { userId, status: statusToGet }], {
        enabled: isAuthenticated,
        refetchOnMount: 'always',
        select: (data) => {
            const filterValue = (val: Prompt | IStory) => filter === 'All' ? (isStory(val) || !isStory(val)) : filter === 'Prompts' ? (!isStory(val)) : (isStory(val));
            return data?.filter((val) => filterValue(val));
        }
    });
}