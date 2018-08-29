import React, { Component } from 'react';
import {
  Input, Icon, Menu, Dropdown,
} from 'choerodon-ui';
import _ from 'lodash';
import './CreateIssue.scss';
import TypeTag from '../../../../../components/TypeTag';
import clickOutSide from '../../../../../components/CommonComponent/ClickOutSide';
import { createIssue } from '../../../../../api/NewIssueApi';

const { TextArea } = Input;

class CreateIssue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectIssueType: 'task',
      summary: '',
    };
  }

  handleClickOutside = (e) => {
    const { summary, selectIssueType } = this.state;
    const { handleCancel, onOk } = this.props;
    if (!summary && handleCancel) {
      handleCancel();
    } else {
      // const issue = {
      //   epicId: values.epicId || 0,
      //   parentIssueId: 0,
      //   priorityCode: 'medium',
      //   sprintId: values.sprintId || 0,
      //   summary,
      //   typeCode: selectIssueType,
      //   versionIssueRelDTOList: fixVersionIssueRelDTOList,
      // };
      // createIssue(issue)
      //   .then((res) => {
      //     onOk();
      //   })
      //   .catch((error) => {
      //   });
    }
    // 判空
    // 空，直接退出编辑handleCancel
    // 发请求创建
    // 成功则回调handleSuccuss
    // 失败则提示
  };

  handleChangeSummary = (e) => {
    this.setState({ summary: e.target.value });
  };

  handleChangeType({ key }) {
    this.setState({ selectIssueType: key });
  }

  render() {
    const { style } = this.props;
    const { selectIssueType, summary } = this.state;
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
      <div className="c7n-userMap-createIssue" style={{ ...style }}>
        <div className="c7n-content">
          <TextArea
            autoFocus
            value={summary}
            onChange={this.handleChangeSummary.bind(this)}
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
                  typeCode={selectIssueType}
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
export default clickOutSide(CreateIssue);
