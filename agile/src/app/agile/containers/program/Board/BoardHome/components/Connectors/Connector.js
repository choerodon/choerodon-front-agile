import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Connector.scss';

class Connector extends Component {
  render() {
    const { from, to } = this.props;
    const isToLeft = from.x > to.x;
    return (
      [<path
        className="helperLine"
        d={`
        M${from.x},${from.y} 
        C${isToLeft ? from.x - 50 : from.x + 50},${from.y} ${isToLeft ? to.x + 50 : to.x - 50},${to.y} ${to.x},${to.y}`}
      />, <path
        className="line"
        d={`
        M${from.x},${from.y} 
        C${isToLeft ? from.x - 50 : from.x + 50},${from.y} ${isToLeft ? to.x + 50 : to.x - 50},${to.y} ${to.x},${to.y}`}
        markerStart="url(#StartMarker)"
        markerEnd="url(#arrowhead)"
      />]
    );
  }
}

Connector.propTypes = {

};

export default Connector;
