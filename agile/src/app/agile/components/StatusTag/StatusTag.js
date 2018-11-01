import React, { Component } from 'react';
import './StatusTag.scss';
import { STATUS } from '../../common/Constant';

class StatusTag extends Component {
  // shouldComponentUpdate(nextProps, nextState) {
  //   if (
  //     nextProps.name === this.props.name
  //     && nextProps.color === this.props.color
  //   ) {
  //     return false;
  //   }
  //   return true;
  // }

  render() {
    const {
      name,
      color,
      data,
      style,
    } = this.props;
    return (
      <div
        className="c7n-statusTag"
        style={{
          background: color || (data && STATUS[data.type]) || 'transparent',
          ...style,
        }}
      >
        { name || (data && data.name) || '' }
      </div>
    );
  }
}
export default StatusTag;
