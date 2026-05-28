import React from 'react';
import { SlControlPause } from "react-icons/sl";
import './PlayButton.css'


export const PauseButton = (props) => {

    return (
        <button {...props} className='play-button'>
            <SlControlPause />
        </button>
    );
}