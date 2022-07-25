import { useSession } from "next-auth/react"

export const useUser = () => {
    const session = useSession();
    const userInfo = session.data?.user;
    return { userId: userInfo?.id, name: userInfo?.name, email: userInfo?.email, isAuthenticated: session.status === 'authenticated' }
}