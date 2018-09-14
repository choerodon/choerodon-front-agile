import React, { Component } from 'react';
import Card from '../Card';
import VersionProgress from './VersionProgress';

class VersionProgressWrap extends Component {
  render() {
    return (
      <Card 
        title="版本进度"
        link="#"
      >
        <VersionProgress />
      </Card>
    );
  }
}

export default VersionProgressWrap;
