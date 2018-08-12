import React, { Component } from 'react';
import { Input, Icon, Popover, Menu, Checkbox, Dropdown } from 'choerodon-ui';
import _ from 'lodash';
import './CreateIssue.scss';
import { TYPE, ICON, TYPE_NAME } from '../../../../../common/Constant';
import US from '../../../../../stores/project/userMap/UserMapStore';
import PriorityTag from '../../../../../components/PriorityTag';
import StatusTag from '../../../../../components/StatusTag';
import TypeTag from '../../../../../components/TypeTag';
import UserHead from '../../../../../components/UserHead';

const { TextArea } = Input;

class CreateIssue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectIssueType: 'task',
    };
  }

  handleChangeType({ key }) {
    this.setState({
      selectIssueType: key,
    });
  }

  render() {
    const typeList = (
      <Menu
        style={{
          background: '#fff',
          boxShadow: '0 5px 5px -3px rgba(0, 0, 0, 0.20), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12)',
          borderRadius: '2px',
        }}
        onClick={this.handleChangeType.bind(this)}
      >
        {
          ['story', 'task', 'bug'].map(type => (
            <Menu.Item key={type}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <TypeTag
                  typeCode={type}
                  showName
                />
              </div>
            </Menu.Item>
          ))
        }
      </Menu>
    );
    return (
      <div className="c7n-userMap-createIssue">
        <div className="c7n-content">
          <TextArea
            autoFocus
            onClick={e => e.target.select()}
            className="c7n-textArea"
            autosize={{ minRows: 3, maxRows: 3 }}
            placeholder="在此创建新内容"
          />
        </div>
        <div className="c7n-footer">
          <Dropdown overlay={typeList} trigger={['click']}>
            <div style={{ display: 'flex', alignItem: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <TypeTag
                  typeCode={this.state.selectIssueType}
                  showName
                />
              </div>
              <Icon
                type="arrow_drop_down"
                style={{ fontSize: 16 }}
              />
            </div>
          </Dropdown>
        </div>
      </div>
    );
  }
}
export default CreateIssue;
