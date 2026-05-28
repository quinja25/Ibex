import React from 'react';
import Logo from '../Logo2.svg';
import './Footer.css';

export const Footer = () => {
    return (
        <div className='footer'>
            <img className='logo' src={Logo} alt="" />
            <p>&nbsp;&nbsp;@STUDYSPHERE</p>

            <a className='contact' href="">Contact</a>
        </div>

    );
}