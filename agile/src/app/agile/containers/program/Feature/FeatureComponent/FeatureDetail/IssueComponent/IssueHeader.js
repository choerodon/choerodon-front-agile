import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import {
  Dropdown, Icon, Select, Input, Menu, Button,
} from 'choerodon-ui';
import { ReadAndEdit } from '../../../../../../components/CommonComponent';
import { updateIssue } from '../../../../../../api/NewIssueApi';
import IssueNumber from './IssueNumber';

const { Option } = Select;
const { TextArea } = Input;

const storyPointList = ['0.5', '1', '2', '3', '4', '5', '8', '13'];

@inject('AppState', 'HeaderStore')
@observer class SprintHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      remainingTime: undefined,
      storyPoints: undefined,
    };
  }

  componentDidMount() {
    this.restIssue();
  }

  componentWillReceiveProps(nextProps) {
    const { store } = nextProps;
    const issue = store.getIssue;
    const { remainingTime, storyPoints, summary } = issue;
    this.setState({
      remainingTime,
      storyPoints,
      summary,
    });
  }

  restIssue = () => {
    const { store } = this.props;
    const issue = store.getIssue;
    const { remainingTime, storyPoints, summary } = issue;
    this.setState({
      remainingTime,
      storyPoints,
      summary,
    });
  };

  updateIssueByCode = (pro) => {
    const { store } = this.props;
    const issue = store.getIssue;
    const { state } = this;
    const { reloadIssue, onUpdate } = this.props;
    const obj = {
      issueId: issue.issueId,
      objectVersionNumber: issue.objectVersionNumber,
    };
    if (pro === 'storyPoints' || pro === 'remainingTime') {
      obj[pro] = state[pro] === '' ? null : state[pro];
      updateIssue(obj)
        .then(() => {
          if (reloadIssue) {
            reloadIssue();
          }
          if (onUpdate) {
            onUpdate();
          }
        });
    } else {
      obj[pro] = state[pro] || issue[pro];
      updateIssue(obj)
        .then(() => {
          if (reloadIssue) {
            reloadIssue();
          }
          if (onUpdate) {
            onUpdate();
          }
        });
    }
  };

  handleTitleChange = (e) => {
    this.setState({ summary: e.target.value });
  };

  handleChangeRemainingTime = (value) => {
    const { remainingTime } = this.state;
    // 只允许输入整数，选择时可选0.5
    if (value === '0.5') {
      this.setState({
        remainingTime: '0.5',
      });
    } else if (/^(0|[1-9][0-9]*)(\[0-9]*)?$/.test(value) || value === '') {
      this.setState({
        remainingTime: String(value).slice(0, 3), // 限制最长三位,
      });
    } else if (value.toString().charAt(value.length - 1) === '.') {
      this.setState({
        remainingTime: value.slice(0, -1),
      });
    } else {
      this.setState({
        remainingTime,
      });
    }
  };

  handleChangeStoryPoint = (value) => {
    const { storyPoints } = this.state;
    // 只允许输入整数，选择时可选0.5
    if (value === '0.5') {
      this.setState({
        storyPoints: '0.5',
      });
    } else if (/^(0|[1-9][0-9]*)(\[0-9]*)?$/.test(value) || value === '') {
      this.setState({
        storyPoints: String(value).slice(0, 3), // 限制最长三位,
      });
    } else if (value.toString().charAt(value.length - 1) === '.') {
      this.setState({
        storyPoints: value.slice(0, -1),
      });
    } else {
      this.setState({
        storyPoints,
      });
    }
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

  setCurrentRae = (data) => {
    const { store } = this.props;
    store.setCurrentRae(data);
  };

  render() {
    const { remainingTime, storyPoints, summary } = this.state;
    const {
      resetIssue, backUrl, onCancel, loginUserId, hasPermission,
      store, AppState,
    } = this.props;
    const urlParams = AppState.currentMenuType;
    const currentRae = store.getCurrentRae;
    const issue = store.getIssue;
    const {
      parentIssueId, typeCode, parentIssueNum, issueNum, summary: originSummary,
      issueId, createdById, storyPoints: originStoryPoints,
      remainingTime: originRemainingTime, subIssueDTOList = [],
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
      <div className="c7n-content-top">
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
              <ReadAndEdit
                callback={this.setCurrentRae}
                thisType="summary"
                line
                current={currentRae}
                origin={originSummary}
                onOk={this.updateIssueByCode.bind(this, 'summary')}
                onCancel={this.restIssue.bind(this)}
                readModeContent={(
                  <div className="c7n-summary">
                    {originSummary}
                  </div>
                )}
              >
                <TextArea
                  maxLength={44}
                  value={summary}
                  size="small"
                  onChange={this.handleTitleChange.bind(this)}
                  onPressEnter={() => {
                    this.updateIssueByCode('summary');
                    this.setCurrentRae(undefined);
                  }}
                />
              </ReadAndEdit>
              <div style={{ flexShrink: 0, color: 'rgba(0, 0, 0, 0.65)' }}>
                <Dropdown overlay={getMenu()} trigger={['click']}>
                  <Button icon="more_vert" />
                </Dropdown>
              </div>
            </div>
            {/* 故事点 */}
            <div className="line-start">
              {
                issueId && typeCode === 'story' ? (
                  <div style={{ display: 'flex', marginRight: 25 }}>
                    <span>故事点：</span>
                    <div style={{ maxWidth: 130 }}>
                      <ReadAndEdit
                        callback={this.setCurrentRae}
                        thisType="storyPoints"
                        current={currentRae}
                        handleEnter
                        origin={originStoryPoints}
                        onOk={this.updateIssueByCode.bind(this, 'storyPoints')}
                        onCancel={this.restIssue.bind(this)}
                        readModeContent={(
                          <span>
                            {originStoryPoints === undefined || originStoryPoints === null ? '无' : `${originStoryPoints} 点`}
                          </span>
                        )}
                      >
                        <Select
                          value={storyPoints && storyPoints.toString()}
                          mode="combobox"
                          ref={(e) => {
                            this.componentRef = e;
                          }}
                          onPopupFocus={(e) => {
                            this.componentRef.rcSelect.focus();
                          }}
                          tokenSeparators={[',']}
                          style={{ marginTop: 0, paddingTop: 0 }}
                          onChange={value => this.handleChangeStoryPoint(value)}
                        >
                          {storyPointList.map(sp => (
                            <Option key={sp.toString()} value={sp}>
                              {sp}
                            </Option>
                          ))}
                        </Select>
                      </ReadAndEdit>
                    </div>
                  </div>
                ) : null
              }
              {
                issueId && typeCode !== 'issue_epic' ? (
                  <div style={{ display: 'flex' }}>
                    <span>预估时间：</span>
                    <div style={{ maxWidth: 150 }}>
                      <ReadAndEdit
                        callback={this.setCurrentRae}
                        thisType="remainingTime"
                        current={currentRae}
                        handleEnter
                        origin={originRemainingTime}
                        onOk={this.updateIssueByCode.bind(this, 'remainingTime')}
                        onCancel={this.restIssue.bind(this)}
                        readModeContent={(
                          <span>
                            {originRemainingTime === undefined || originRemainingTime === null ? '无' : `${originRemainingTime} 小时`}
                          </span>
                        )}
                      >
                        <Select
                          value={remainingTime && remainingTime.toString()}
                          mode="combobox"
                          ref={(e) => {
                            this.componentRef = e;
                          }}
                          onPopupFocus={(e) => {
                            this.componentRef.rcSelect.focus();
                          }}
                          tokenSeparators={[',']}
                          style={{ marginTop: 0, paddingTop: 0 }}
                          onChange={value => this.handleChangeRemainingTime(value)}
                        >
                          {storyPointList.map(sp => (
                            <Option key={sp.toString()} value={sp}>
                              {sp}
                            </Option>
                          ))}
                        </Select>
                      </ReadAndEdit>
                    </div>
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
