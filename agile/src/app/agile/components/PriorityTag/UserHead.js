import React, { Component } from 'react';
import { Button, Table, Spin, Popover, Tooltip, Icon, Avatar } from 'choerodon-ui';
import './UserHead.scss';

const COLOR = {
  medium: {
    color: '#3575df',
    bgColor: 'rgba(77, 144, 254, 0.2)',
  },
  high: {
    color: '#ffb100',
    bgColor: 'rgba(255, 177, 0, 0.12)',
  },
  low: {
    color: 'rgba(0, 0, 0, 0.36)',
    bgColor: 'rgba(0, 0, 0, 0.08)',
  },
};

class UserHead extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
  }

  getFirst(str) {
    if (!str) {
      return '';
    }
    const re = /[\u4E00-\u9FA5]/g;
    for (let i = 0, len = str.length; i < len; i += 1) {
      if (re.test(str[i])) {
        return str[i];
      }
    }
    return '';
  }

  render() {
    const { priority } = this.props; 
    return (
      <div
        className=""
        style={{
          ...this.props.style,
          backgroundColor: COLOR[priority.priorityCode].bgColor,
          color: COLOR[priority.priorityCode].color,
          borderRadius: '2px',
          padding: '0 4px',
          display: 'inline-block',
          lineHeight: '20px',
          fontSize: '13px',
        }}
      >
        { `${priority.priorityName}` }
      </div>
    );
  }
}
export default UserHead;
