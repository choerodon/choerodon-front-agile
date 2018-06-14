import React, { Component } from 'react';
import { Button, Table, Spin, Popover, Tooltip, Icon, Avatar } from 'choerodon-ui';
import './UserHead.scss';

const ICON = {
  story: 'turned_in',
  bug: 'bug_report',
  task: 'assignment',
  issue_epic: 'priority',
  sub_task: 'sutask',
};

const TYPE = {
  story: '#00bfa5',
  bug: '#f44336',
  task: '#4d90fe',
  issue_epic: '#743be7',
  sub_task: '#4d90fe',
};

class UserHead extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
  }

  render() {
    const { type } = this.props; 
    return (
      <div
        className=""
        style={{
          backgroundColor: TYPE[type.typeCode],
          display: 'flex',
          width: 20,
          height: 20,
          borderRadius: '50%',
          color: '#fff',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Icon
          style={{ fontSize: '14px' }}
          type={ICON[type.typeCode]}
        />
      </div>
    );
  }
}
export default UserHead;
