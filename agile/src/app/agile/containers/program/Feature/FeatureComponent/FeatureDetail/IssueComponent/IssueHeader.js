import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import {
  Dropdown, Icon, Menu, Button,
} from 'choerodon-ui';
import IssueNumber from './IssueNumber';
import { FieldStoryPoint, FieldText } from './IssueBody/Field';
import './IssueComponent.scss';

@inject('AppState', 'HeaderStore')
@observer class SprintHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
  }

  handleClickMenu = (e) => {
    const { store } = this.props;
    const issue = store.getIssue;
    if (e.key === '0') {
      store.setWorkLogShow(true);
    } else if (e.key === '1') {
      this.handleDeleteIssue(issue.issueId);
    } else if (e.key === '2') {
      store.setCreateSubTaskShow(true);
    } else if (e.key === '3') {
      store.setCopyIssueShow(true);
    } else if (e.key === '4') {
      store.setTransformSubIssueShow(true);
    } else if (e.key === '5') {
      store.setTransformFromSubIssueShow(true);
    } else if (e.key === '6') {
      store.setCreateBranchShow(true);
    } else if (e.key === '7') {
      store.setAssigneeShow(true);
    } else if (e.key === '8') {
      store.setChangeParentShow(true);
    }
  };

  render() {
    const {
      resetIssue, backUrl, onCancel, loginUserId, hasPermission,
      store, AppState,
    } = this.props;
    const urlParams = AppState.currentMenuType;
    const issue = store.getIssue;
    const {
      parentIssueId, typeCode, parentIssueNum, issueNum,
      issueId, createdById, subIssueDTOList = [],
    } = issue;

    const getMenu = () => (
      <Menu onClick={this.handleClickMenu.bind(this)}>
        <Menu.Item key="0">
          {'登记工作日志'}
        </Menu.Item>
        {
          <Menu.Item
            key="1"
            disabled={loginUserId !== createdById && !hasPermission}
          >
            {'删除'}
          </Menu.Item>
        }
        {
          ['sub_task', 'feature'].indexOf(typeCode) === -1 && (
            <Menu.Item key="2">
              {'创建子任务'}
            </Menu.Item>
          )
        }
        <Menu.Item key="3">
          {'复制问题'}
        </Menu.Item>
        {
          ['sub_task', 'feature'].indexOf(typeCode) === -1 && subIssueDTOList.length === 0 && (
            <Menu.Item key="4">
              {'转化为子任务'}
            </Menu.Item>
          )
        }
        {
          typeCode === 'sub_task' && (
            <Menu.Item key="5">
              {'转化为任务'}
            </Menu.Item>
          )
        }
        {
          typeCode !== 'feature' && (
            <Menu.Item key="6">
              {'创建分支'}
            </Menu.Item>
          )
        }
        {
          typeCode !== 'feature' && (
            <Menu.Item key="7">
              {'分配问题'}
            </Menu.Item>
          )
        }
        {
          typeCode === 'sub_task' && (
            <Menu.Item key="8">
              {'修改父级'}
            </Menu.Item>
          )
        }
      </Menu>
    );

    return (
      <div className="c7n-issue-header">
        <div className="c7n-header-editIssue">
          <div className="c7n-content-editIssue" style={{ overflowY: 'hidden' }}>
            <div
              className="line-justify"
              style={{
                height: '28px',
                alignItems: 'center',
                marginTop: '10px',
                marginBottom: '3px',
              }}
            >
              {/* 问题编号 */}
              <IssueNumber
                parentIssueId={parentIssueId}
                resetIssue={resetIssue}
                urlParams={urlParams}
                backUrl={backUrl}
                typeCode={typeCode}
                parentIssueNum={parentIssueNum}
                issueNum={issueNum}
              />
              {/* 隐藏 */}
              <div
                style={{
                  cursor: 'pointer', fontSize: '13px', lineHeight: '20px', display: 'flex', alignItems: 'center',
                }}
                role="none"
                onClick={() => {
                  onCancel();
                }}
              >
                <Icon type="last_page" style={{ fontSize: '18px', fontWeight: '500' }} />
                <span>隐藏详情</span>
              </div>
            </div>
            {/* 主题 */}
            <div className="line-justify" style={{ marginBottom: 5, alignItems: 'flex-start', width: '360px' }}>
              <FieldText {...this.props} showTitle={false} field={{ code: 'summary', name: '概要' }} />
              <div style={{ flexShrink: 0, color: 'rgba(0, 0, 0, 0.65)' }}>
                <Dropdown overlay={getMenu()} trigger={['click']}>
                  <Button icon="more_vert" />
                </Dropdown>
              </div>
            </div>
            {/* 故事点 */}
            <div className="line-start">
              {
                issueId && ['story', 'feature'].indexOf(typeCode) !== -1 ? (
                  <div style={{ display: 'flex', marginRight: 25 }}>
                    <FieldStoryPoint {...this.props} field={{ code: 'storyPoints', name: '故事点' }} />
                  </div>
                ) : null
              }
              {
                issueId && ['issue_epic'].indexOf(typeCode) !== -1 ? (
                  <div style={{ display: 'flex' }}>
                    <FieldStoryPoint {...this.props} field={{ code: 'estimateTime', name: '预估时间' }} />
                  </div>
                ) : null
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SprintHeader;
