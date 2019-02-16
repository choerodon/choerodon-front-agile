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

  renderStatusBackground = (categoryCode) => {
    if (categoryCode === 'todo') {
      return 'rgb(255, 177, 0)';
    } else if (categoryCode === 'doing') {
      return 'rgb(77, 144, 254)';
    } else if (categoryCode === 'done') {
      return 'rgb(0, 191, 165)';
    } else {
      return 'gray';
    }
  };

  render() {
    const {
      name,
      color,
      data,
      style,
      categoryCode,
    } = this.props;
    return (
      <div
        className="c7n-statusTag"
        style={{
          background: color || (categoryCode && this.renderStatusBackground(categoryCode)) || (data && STATUS[data.type]) || 'transparent',
          ...style,
        }}
      >
        { name || (data && data.name) || '' }
      </div>
    );
  }
}
export default StatusTag;
