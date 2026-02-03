import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { privateRoutes, publicRoutes } from './Routes/Route';
import NavBar from './Components/NavBar/NavBar';
import Footer from './Components/Footer/Footer';
import ChatWidget from './Components/ChatAI/ChatWidget';
import { useSelector } from 'react-redux';

function App() {
    const currentUser = useSelector((state) => state.auth.login.currentUser);

    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* không cần login */}
                    {publicRoutes.map((route, index) => {
                        const Page = route.component;

                        return (
                            <>
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={
                                        <>
                                            {route.navbar ? <NavBar /> : ''}
                                            <Page />
                                            {route.footer ? <Footer /> : ''}
                                        </>
                                    }
                                />
                            </>
                        );
                    })}
                    {/* Cần login */}
                    {privateRoutes.map((route, index) => {
                        const Page = route.component;
                        return (
                            <Route
                                key={index}
                                path={route.path}
                                element={
                                    <>
                                        {route.navbar ? <NavBar /> : ''}
                                        <Page />
                                        {route.footer ? <Footer /> : ''}
                                    </>
                                }
                            />
                        );
                    })}
                </Routes>
                {(!currentUser || !currentUser.admin) && <ChatWidget />}
            </div>
        </Router>
    );
}

export default App;
