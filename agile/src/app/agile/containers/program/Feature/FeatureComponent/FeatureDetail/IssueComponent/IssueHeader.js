import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import {
  Dropdown, Icon, Menu, Button, Modal,
} from 'choerodon-ui';
import IssueNumber from './IssueNumber';
import { FieldStoryPoint, FieldText } from './IssueBody/Field';
import { deleteIssue } from '../../../../../../api/NewIssueApi';
import './IssueComponent.scss';

const { confirm } = Modal;

@inject('AppState', 'HeaderStore')
@observer class SprintHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
  }

  handleDeleteIssue = (issueId) => {
    const { store, onDeleteIssue } = this.props;
    const issue = store.getIssue;
    const { issueNum } = issue;
    confirm({
      width: 560,
      title: `删除特性${issueNum}`,
      content:
        (
          <div>
            <p style={{ marginBottom: 10 }}>请确认您要删除这个特性。</p>
            <p style={{ marginBottom: 10 }}>这个特性将会被彻底删除。包括所有附件和评论。</p>
            <p style={{ marginBottom: 10 }}>如果您完成了这个问题，通常是已解决或者已关闭，而不是删除。</p>
          </div>
        ),
      onOk() {
        return deleteIssue(issueId)
          .then((res) => {
            if (onDeleteIssue) {
              onDeleteIssue();
            }
          });
      },
      onCancel() { },
      okText: '删除',
      okType: 'danger',
    });
  };

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
      issueId, createdById,
    } = issue;

    const getMenu = () => (
      <Menu onClick={this.handleClickMenu.bind(this)}>
        {
          <Menu.Item
            key="1"
            disabled={loginUserId !== createdById && !hasPermission}
          >
            {'删除'}
          </Menu.Item>
        }
        <Menu.Item key="3">
          {'复制问题'}
        </Menu.Item>
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
              <FieldText
                {...this.props}
                showTitle={false}
                field={{ fieldCode: 'summary', fieldName: '概要', textStyle: { fontSize: 20, fontWeight: 500, width: '100%' } }}
              />
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
                    <FieldStoryPoint {...this.props} field={{ fieldCode: 'storyPoints', fieldName: '故事点' }} />
                  </div>
                ) : null
              }
              {
                issueId && ['issue_epic'].indexOf(typeCode) !== -1 ? (
                  <div style={{ display: 'flex' }}>
                    <FieldStoryPoint {...this.props} field={{ fieldCode: 'estimateTime', fieldName: '预估时间' }} />
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
