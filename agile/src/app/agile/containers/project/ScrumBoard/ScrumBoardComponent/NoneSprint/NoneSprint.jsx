/* eslint-disable react/self-closing-comp,jsx-a11y/accessible-emoji */
import React from 'react';
import './NoneSprint.scss';
import EmptyScrumboard from '../../../../../assets/image/emptyScrumboard.svg';

const NoneSprint = () => (
  <React.Fragment>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <div className="emojis">
        <div>L️</div>
        <div>O</div>
        <div>A</div>
        <div>D</div>
        <div>I</div>
        <div>N</div>
        <div>G</div>
      </div>

      <div className="palette">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  </React.Fragment>
);

export default NoneSprint;
