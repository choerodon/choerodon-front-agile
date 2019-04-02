import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import TimeAgo from 'timeago-react';
import { Button, Icon, Popover } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';

const STATUS_SHOW = {
  opened: '开放',
  merged: '已合并',
  closed: '关闭',
};

@inject('AppState')
@observer class IssueBranch extends Component {
  constructor(props) {
    super(props);
    this.sign = false;
    this.state = {
      createBranchShow: false,
      commitShow: false,
    };
  }

  componentDidMount() {
  }

  renderBranchs() {
    const { branchs } = this.state;
    return (
      <div>
        {
          branchs.branchCount ? (
            <div>
              {
                [].length === 0 ? (
                  <div style={{
                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)', display: 'flex', padding: '8px 26px', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px',
                  }}
                  >
                    <div style={{ display: 'inline-flex', justifyContent: 'space-between', flex: 1 }}>
                      <span
                        style={{ color: '#3f51b5', cursor: 'pointer' }}
                        role="none"
                        onClick={() => {
                          this.setState({
                            commitShow: true,
                          });
                        }}
                      >
                        {branchs.totalCommit || '0'}
                        {'提交'}
                      </span>
                    </div>
                    <div style={{ display: 'inline-flex', justifyContent: 'space-between' }}>
                      <span style={{ marginRight: 12, marginLeft: 63 }}>已更新</span>
                      <span style={{ width: 60, display: 'inline-block' }}>
                        {
                          branchs.commitUpdateTime ? (
                            <Popover
                              title="提交修改时间"
                              content={branchs.commitUpdateTime}
                              placement="left"
                            >
                              <TimeAgo
                                datetime={branchs.commitUpdateTime}
                                locale={Choerodon.getMessage('zh_CN', 'en')}
                              />
                            </Popover>
                          ) : ''
                        }
                      </span>
                    </div>
                  </div>
                ) : null
              }
              {
                branchs.totalMergeRequest ? (
                  <div style={{
                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)', display: 'flex', padding: '8px 26px', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px',
                  }}
                  >
                    <div style={{ display: 'inline-flex', justifyContent: 'space-between', flex: 1 }}>
                      <span
                        style={{ color: '#3f51b5', cursor: 'pointer' }}
                        role="none"
                        onClick={() => {
                          this.setState({
                            mergeRequestShow: true,
                          });
                        }}
                      >
                        {branchs.totalMergeRequest}
                        {'合并请求'}
                      </span>
                      <span style={{
                        width: 36, height: 20, borderRadius: '2px', color: '#fff', background: '#4d90fe', textAlign: 'center',
                      }}
                      >
                        {['opened', 'merged', 'closed'].includes(branchs.mergeRequestStatus) ? STATUS_SHOW[branchs.mergeRequestStatus] : ''}
                      </span>
                    </div>
                    <div style={{ display: 'inline-flex', justifyContent: 'space-between' }}>
                      <span style={{ marginRight: 12, marginLeft: 63 }}>已更新</span>
                      <span style={{ width: 60, display: 'inline-block' }}>
                        {
                          branchs.mergeRequestUpdateTime ? (
                            <Popover
                              title="合并请求修改时间"
                              content={branchs.mergeRequestUpdateTime}
                              placement="left"
                            >
                              <TimeAgo
                                datetime={branchs.mergeRequestUpdateTime}
                                locale={Choerodon.getMessage('zh_CN', 'en')}
                              />
                            </Popover>
                          ) : ''
                        }
                      </span>
                    </div>
                  </div>
                ) : null
              }
            </div>
          ) : (
            <div style={{
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)', display: 'flex', padding: '8px 26px', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px',
            }}
            >
              <span style={{ marginRight: 12 }}>暂无</span>
            </div>
          )
        }
      </div>
    );
  }

  render() {
    const { createBranchShow, commitShow } = this.state;
    const {
      intl, store, branchs,
    } = this.props;

    return (
      <div id="branch">
        <div className="c7n-title-wrapper">
          <div className="c7n-title-left">
            <Icon type="branch c7n-icon-title" />
            <FormattedMessage id="issue.branch" />
          </div>
          <div style={{
            flex: 1, height: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)', marginLeft: '14px',
          }}
          />
          <div className="c7n-title-right" style={{ marginLeft: '14px' }}>
            <Button className="leftBtn" funcType="flat" onClick={() => this.setState({ createBranchShow: true })}>
              <Icon type="playlist_add icon" />
              <FormattedMessage id="issue.branch.create" />
            </Button>
          </div>
        </div>
        {this.renderBranchs()}
        {
          store.getCreateBranchShow ? (
            <CreateBranch
              issueId={origin.issueId}
              typeCode={typeCode}
              issueNum={origin.issueNum}
              onOk={() => {
                this.setState({ createBranchShow: false });
                this.reloadIssue();
              }}
              onCancel={() => this.setState({ createBranchShow: false })}
              visible={createBranchShow}
            />
          ) : null
        }
        {
          store.getCommitShow ? (
            <Commits
              issueId={origin.issueId}
              issueNum={origin.issueNum}
              time={branchs.commitUpdateTime}
              onCancel={() => {
                this.setState({ commitShow: false });
              }}
              visible={commitShow}
            />
          ) : null
        }
        {
          store.getMergeRequestShow ? (
            <MergeRequest
              issueId={origin.issueId}
              issueNum={origin.issueNum}
              num={branchs.totalMergeRequest}
              onCancel={() => {
                this.setState({ mergeRequestShow: false });
              }}
              visible={mergeRequestShow}
            />
          ) : null
        }
      </div>
    );
  }
}

export default withRouter(injectIntl(IssueBranch));
