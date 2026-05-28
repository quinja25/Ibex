import React from 'react';
import { SlControlPlay } from "react-icons/sl";
import './PlayButton.css'


export const PlayButton = (props) => {

    return (
        <button {...props} className='play-button'>
            <SlControlPlay />
        </button>
    );
}