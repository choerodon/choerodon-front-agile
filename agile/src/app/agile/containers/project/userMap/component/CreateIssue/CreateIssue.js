import React, { Component } from 'react';
import {
  Input, Icon, Menu, Dropdown, Spin,
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
      loading: false,
    };
    this.couldCreate = true;
  }

  handleClickOutside = (e) => {
    this.handleCreateIssue();
  };

  handlePresEnter = (e) => {
    e.preventDefault();
    this.handleCreateIssue();
  }

  handleCreateIssue = () => {
    const { summary, selectIssueType, loading } = this.state;
    const { onCancel, onOk, data } = this.props;
    if (!summary && onCancel) {
      onCancel();
    } else if (this.couldCreate) {
      this.couldCreate = false;
      const issue = {
        epicId: data.epicId,
        parentIssueId: 0,
        priorityCode: 'medium',
        sprintId: data.sprintId,
        summary,
        typeCode: selectIssueType,
        versionIssueRelDTOList: data.versionId ? [{
          relationType: 'fix',
          versionId: data.versionId,
        }] : undefined,
      };
      this.setState({ loading: true });
      createIssue(issue)
        .then((res) => {
          onOk(res);
        })
        .catch((error) => {
          this.setState({ loading: false });
          this.couldCreate = true;
        });
    } else {
      // waiting
    }
  }

  handleChangeSummary = (e) => {
    this.setState({ summary: e.target.value });
  };

  handleChangeType({ key }) {
    this.setState({ selectIssueType: key });
  }

  render() {
    const { style } = this.props;
    const { selectIssueType, summary, loading } = this.state;
    const typeList = (
      <Menu
        className="ignore-react-onclickoutside"
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
      <div className="c7n-userMap-createIssue" style={{ ...style }} disableOnClickOutside>
        <Spin spinning={loading}>
          <div className="c7n-content">
            <TextArea
              autoFocus
              value={summary}
              onChange={this.handleChangeSummary}
              onPressEnter={this.handlePresEnter}
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
        </Spin>
      </div>
    );
  }
}
export default clickOutSide(CreateIssue);
