import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import {
  Button, Input, Dropdown, Menu, Icon,
} from 'choerodon-ui';
import { axios, stores } from 'choerodon-front-boot';
import IssueStore from '../../../../stores/project/sprint/IssueStore';
import { createIssue, loadPriorities } from '../../../../api/NewIssueApi';
import TypeTag from '../../../../components/TypeTag';

const { AppState } = stores;

@observer
class QuickCreateIssue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkCreateIssue: false,
      createLoading: false,
      createIssueValue: '',
      selectIssueType: 'task',
      defaultPriorityId: false,
    };
  }

  componentDidMount() {
    loadPriorities().then((res) => {
      if (res && res.length) {
        const defaultPriority = res.find(p => p.default);
        const defaultPriorityId = defaultPriority ? defaultPriority.id : '';
        this.setState({
          defaultPriorityId,
        });
        IssueStore.setPriorities(res);
        IssueStore.setDefaultPriorityId(defaultPriorityId);
      } else {
        this.setState({
          defaultPriorityId: '',
        });
        IssueStore.setPriorities([]);
        IssueStore.setDefaultPriorityId('');
      }
    });
  }

  handleBlurCreateIssue = () => {
    const { defaultPriorityId, createIssueValue, selectIssueType } = this.state;
    const currentType = IssueStore.getIssueTypes.find(t => t.typeCode === selectIssueType);
    if (createIssueValue !== '') {
      const { history } = this.props;
      const {
        type, id, name, organizationId,
      } = AppState.currentMenuType;
      axios.get(`/agile/v1/projects/${id}/project_info`)
        .then((res) => {
          const data = {
            priorityCode: `priority-${defaultPriorityId}`,
            priorityId: defaultPriorityId,
            projectId: id,
            sprintId: 0,
            summary: createIssueValue,
            issueTypeId: currentType.id,
            typeCode: currentType.typeCode,
            epicId: 0,
            epicName: selectIssueType === 'issue_epic' ? createIssueValue : undefined,
            parentIssueId: 0,
          };
          this.setState({
            createLoading: true,
          });
          createIssue(data)
            .then((response) => {
              IssueStore.init();
              IssueStore.loadIssues();
              this.setState({
                createIssueValue: '',
                createLoading: false,
              });
              history.push(`/agile/issue?type=${type}&id=${id}&name=${encodeURIComponent(name)}&organizationId=${organizationId}&paramName=${response.issueNum}&paramIssueId=${response.issueId}&paramOpenIssueId=${response.issueId}`);
            })
            .catch((error) => {
            });
        });
    }
  };

  handleChangeType = (type) => {
    this.setState({
      selectIssueType: type.key,
    });
  };


  render() {
    const {
      checkCreateIssue, createLoading, selectIssueType, createIssueValue,
    } = this.state;
    const issueTypes = IssueStore.getIssueTypes;
    const currentType = issueTypes.find(t => t.typeCode === selectIssueType);
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
          issueTypes.filter(t => t.typeCode !== 'sub_task').map(type => (
            <Menu.Item key={type.typeCode}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <TypeTag
                  data={type}
                  showName
                />
              </div>
            </Menu.Item>
          ))
        }
      </Menu>
    );
    return (
      <div
        className="c7n-backlog-sprintIssue"
        style={{
          userSelect: 'none',
          background: 'white',
          padding: '12px 0 12px 19px',
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #e8e8e8',
        }}
      >
        {checkCreateIssue ? (
          <div className="c7n-add" style={{ display: 'block', width: '100%' }}>
            <div style={{ display: 'flex' }}>
              <Dropdown overlay={typeList} trigger={['click']}>
                <div style={{ display: 'flex', alignItem: 'center' }}>
                  <TypeTag
                    data={currentType}
                  />
                  <Icon
                    type="arrow_drop_down"
                    style={{ fontSize: 16 }}
                  />
                </div>
              </Dropdown>
              <div style={{ marginLeft: 8, flexGrow: 1 }}>
                <Input
                  autoFocus
                  value={createIssueValue}
                  placeholder="需要做什么？"
                  onChange={(e) => {
                    this.setState({
                      createIssueValue: e.target.value,
                    });
                  }}
                  maxLength={44}
                  onPressEnter={this.handleBlurCreateIssue.bind(this)}
                />
              </div>
            </div>
            <div
              style={{
                marginTop: 10,
                display: 'flex',
                marginLeft: 32,
                justifyContent: !IssueStore.getExpand ? 'flex-start' : 'flex-end',
              }}
            >
              <Button
                type="primary"
                onClick={() => {
                  this.setState({
                    checkCreateIssue: false,
                  });
                }}
              >
                {'取消'}
              </Button>
              <Button
                type="primary"
                loading={createLoading}
                onClick={this.handleBlurCreateIssue.bind(this)}
              >
                {'确定'}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            className="leftBtn"
            style={{ color: '#3f51b5' }}
            funcType="flat"
            onClick={() => {
              this.setState({
                checkCreateIssue: true,
                createIssueValue: '',
              });
            }}
          >
            <Icon type="playlist_add icon" />
            <span>创建问题</span>
          </Button>
        )}
      </div>
    );
  }
}

export default QuickCreateIssue;
