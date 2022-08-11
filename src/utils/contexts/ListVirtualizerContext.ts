import * as React from 'react';

interface ContextValues {
    remeasure: () => void
}

export const ListVirtualizerContext = React.createContext<ContextValues | null>(null);