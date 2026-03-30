import React from 'react';

const Home = () => {
    const username = localStorage.getItem('username');

    return (
        <div>
            <h1>Benvenuti al MEMEMUSEUM</h1>
            {username ? (
                <p>Ciao, <strong>{username}</strong>! Sei pronto a caricare nuovi meme?</p>
            ) : (
                <p>Effettua il login per votare e caricare i tuoi contenuti.</p>
            )}
        </div>
    );
};

export default Home;