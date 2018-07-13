import React, { Component } from 'react';
import { Button, Table, Spin, Popover, Tooltip, Icon, Avatar } from 'choerodon-ui';
import './UserHead.scss';

const ICON = {
  story: 'turned_in',
  bug: 'bug_report',
  task: 'assignment',
  issue_epic: 'priority',
  sub_task: 'relation',
};

const TYPE = {
  story: '#00bfa5',
  bug: '#f44336',
  task: '#4d90fe',
  issue_epic: '#743be7',
  sub_task: '#4d90fe',
};

const NAME = {
  story: '故事',
  bug: '故障',
  task: '任务',
  issue_epic: '史诗',
  sub_task: '子任务',
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
      <div style={{ display: 'flex' }}>
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
        {
          this.props.showName && (
            <span style={{ marginLeft: 8 }}>{NAME[type.typeCode]}</span>
          )
        }
      </div>
    );
  }
}
export default UserHead;
