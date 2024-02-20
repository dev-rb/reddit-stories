import { ParentComponent, createContext, useContext } from 'solid-js';
import { Comments } from '~/utils/reddit';

type CommentsContextValues = Comments;

const CommentsContext = createContext<CommentsContextValues>();

export const CommentsProvider: ParentComponent<{ comments: Comments }> = (props) => {
  return <CommentsContext.Provider value={props.comments}>{props.children}</CommentsContext.Provider>;
};
export const useComments = () => useContext(CommentsContext)!;
