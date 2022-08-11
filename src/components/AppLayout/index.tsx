import { useRouter } from "next/router";
import React from "react";
import BottomNavigationBar from "../BottomNavigationBar";

const blacklistRoutes = [
    '/signin', '/signup', '/signin/confirmation'
]

const AppLayout = ({ children }: { children: React.ReactNode }) => {
    const [hasMounted, setHasMounted] = React.useState(false);

    const router = useRouter();
    React.useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) return null

    // console.log(router.pathname)

    return (
        <>
            <main> {children} </main>
            {!blacklistRoutes.includes(router.pathname) && <BottomNavigationBar />}
        </>
    );
}

export default AppLayout;