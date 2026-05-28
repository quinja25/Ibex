import React from 'react';
import './BackButton.css'
import { SlArrowLeft } from "react-icons/sl";



export const BackButton = (props) => {
    return (
        <button {...props} className='back-button'>
            <SlArrowLeft />
        </button>
    );
}