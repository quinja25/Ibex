import React, { useContext } from 'react';
import ReactSlider from 'react-slider';
import './Slider.css';
import SettingsContext from './SettingsContext';
import { BackButton } from './BackButton';


export const TimerSetting = () => {
    const settingsInfo = useContext(SettingsContext);

    return (
        <div className='full-box-here'>
            <BackButton onClick={() => settingsInfo.setShowSettings(false)} />
            <div className='slider-box'>
                <label>study: {settingsInfo.studyMinuites}:00</label>
                <ReactSlider
                    className={'slider'}
                    thumbClassName={'thumb'}
                    trackClassName={'track'}
                    value={settingsInfo.studyMinuites}
                    onChange={newValue => settingsInfo.setStudyMinuites(newValue)}
                    min={1}
                    max={120}
                />
                <label>break: {settingsInfo.breakMinuites}:00</label>
                <ReactSlider
                    className={'slider-green'}
                    thumbClassName={'thumb-green'}
                    trackClassName={'track'}
                    value={settingsInfo.breakMinuites}
                    onChange={newValue => settingsInfo.setBreakMinuites(newValue)}
                    min={1}
                    max={120}
                />
            </div>



        </div>
    );
}