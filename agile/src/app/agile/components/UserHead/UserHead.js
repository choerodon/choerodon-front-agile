import React, { Component } from 'react';
import { Button, Table, Spin, Popover, Tooltip, Icon, Avatar } from 'choerodon-ui';
import './UserHead.scss';

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
    const { user } = this.props; 
    return (
      <div
        className="c7n-emptyBlock"
        style={{
          ...this.props.style,
          display: user.id ? 'flex' : 'none',
        }}
      >
        <Avatar
          style={{
            width: 18,
            height: 18,
            background: '#c5cbe8',
            color: '#6473c3',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 5,
            textAlign: 'center',
          }}
          src={user.avatar}
        >
          {this.getFirst(user.realName)}
        </Avatar>
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '13px',
            lineHeight: '20px',
            color: 'rgba(0, 0, 0, 0.65)',
          }}
        >
          {`${user.loginName}${user.realName}`}
        </span>
      </div>
    );
  }
}
export default UserHead;
