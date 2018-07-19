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

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.user.id === this.props.user.id) {
      return false;
    }
    return true;
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
    return str[0];
  }

  render() {
    const { user, color } = this.props; 
    return (
      <div
        className="c7n-emptyBlock"
        style={{
          ...this.props.style,
          display: user.id ? 'flex' : 'none',
        }}
      >
        {
          this.props.type === 'datalog' ? (
            <div
              style={{
                width: 40,
                height: 40,
                background: '#b3bac5',
                color: '#fff',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                borderRadius: 4,
              }}
            >
              {
                user.avatar ? (
                  <img src={user.avatar} alt="" style={{ width: '100%' }} />
                ) : (
                  <span style={{ width: 40, height: 40, lineHeight: '40px', textAlign: 'center', color: '#fff', fontSize: '12px' }}>
                    {this.getFirst(user.realName)}
                  </span>
                )
              }
            </div>
          ) : (
            <div
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
                borderRadius: '50%',
              }}
            >
              {
                user.avatar ? (
                  <img src={user.avatar} alt="" style={{ width: '100%' }} />
                ) : (
                  <span style={{ width: 18, height: 18, lineHeight: '18px', textAlign: 'center', color: '#6473c3' }}>
                    {this.getFirst(user.realName)}
                  </span>
                )
              }
            </div>
          )
        }
        {
          this.props.hiddenText ? null : (
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '13px',
                lineHeight: '20px',
                color: color || 'rgba(0, 0, 0, 0.65)',
              }}
            >
              {`${user.loginName}${user.realName}`}
            </span>
          )
        }
        
      </div>
    );
  }
}
export default UserHead;
