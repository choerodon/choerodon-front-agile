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

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.status.statusName === this.props.status.statusName && nextProps.status.statusColor === this.props.status.statusColor) {
      return false;
    }
    return true;
  }

  render() {
    const { status } = this.props; 
    return (
      <div
        className="c7n-statusTag"
        style={{
          background: status.statusColor,
          color: '#fff',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          borderRadius: '2px',
          padding: '0 6px',
          lineHeight: '20px',
          fontSize: '12px',
          width: 48,
          textAlign: 'center',
          ...this.props.style,
        }}
      >
        { status.statusName }
      </div>
    );
  }
}
export default UserHead;
