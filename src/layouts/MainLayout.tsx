
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface MainLayoutProps {
    onLogout: () => void;
}

function MainLayout({onLogout}: MainLayoutProps) {
    return (
        <>
        <Navbar onLogout={onLogout}/>

            <main>
                <Outlet />
            </main>
        <Footer /> 
        </>
    );
}
export default MainLayout;
