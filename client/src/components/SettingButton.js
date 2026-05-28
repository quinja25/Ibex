import React from 'react';
import { SlSettings } from "react-icons/sl";
import './PlayButton.css'


export const SettingButton = (props) => {

    return (
        <button {...props} className='play-button'>
            <SlSettings />
        </button>
    );
}