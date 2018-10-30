import React, { Component } from 'react';
import './StatusTag.scss';

class StatusTag extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    if (
      nextProps.name === this.props.name
      && nextProps.color === this.props.color
    ) {
      return false;
    }
    return true;
  }

  render() {
    const { name, color, style } = this.props;
    return (
      <div
        className="c7n-statusTag"
        style={{
          background: color || 'transparent',
          ...style,
        }}
      >
        { name || '' }
      </div>
    );
  }
}
export default StatusTag;
