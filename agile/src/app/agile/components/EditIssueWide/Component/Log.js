import React, { Component } from 'react';
import { Icon, Popconfirm } from 'choerodon-ui';
import { AppState } from 'choerodon-front-boot';
import _ from 'lodash';
import UserHead from '../../UserHead';
import WYSIWYGEditor from '../../WYSIWYGEditor';
import { IssueDescription } from '../../CommonComponent';
import { delta2Html, text2Delta, beforeTextUpload, formatDate } from '../../../common/utils';
import { deleteWorklog, updateWorklog } from '../../../api/NewIssueApi';
import './Log.scss';


class Log extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      editLogId: undefined,
      editLog: undefined,
      expand: false,
    };
  }

  componentDidMount() {
  }

  confirm(logId, e) {
    this.handleDeleteLog(logId);
  }

  cancel(e) {
    window.console.log('cancle');
  }

  handleDeleteLog(logId) {
    deleteWorklog(logId)
      .then((res) => {
        this.props.onDeleteLog();
      });
  }

  handleUpdateLog(log) {
    const { logId, objectVersionNumber } = log;
    const extra = {
      logId,
      objectVersionNumber,
    };
    const updateLogDes = this.state.editLog;
    if (updateLogDes) {
      beforeTextUpload(updateLogDes, extra, this.updateLog, 'description');
    } else {
      extra.description = '';
      this.updateLog(extra);
    }
  }

  updateLog = (log) => {
    updateWorklog(log.logId, log).then((res) => {
      this.setState({
        editLogId: undefined,
        editLog: undefined,
      });
      this.props.onUpdateLog();
    });
  }

  render() {
    const { worklog } = this.props;
    const deltaEdit = text2Delta(this.state.editLog);
    return (
      <div
        className={`c7n-log ${worklog.logId === this.state.editLogId ? 'c7n-log-focus' : ''}`}
      >
        <div className="line-justify">
          {
            this.state.expand ? (
              <Icon
                role="none"
                style={{ 
                  position: 'absolute',
                  left: 5,
                  top: 15,
                }}
                type="baseline-arrow_drop_down pointer"
                onClick={() => {
                  this.setState({
                    expand: false,
                  });
                }}
              />
            ) : null
          }
          {
            !this.state.expand ? (
              <Icon
                role="none"
                style={{ 
                  position: 'absolute',
                  left: 5,
                  top: 15,
                }}
                type="baseline-arrow_right pointer"
                onClick={() => {
                  this.setState({
                    expand: true,
                  });
                }}
              />
            ) : null
          }
          <div className="c7n-title-log">
            <div style={{ marginRight: 19 }}>
              <UserHead
                user={{
                  id: worklog.userId,
                  loginName: '',
                  realName: worklog.userName,
                  avatar: worklog.imageUrl,
                }}
                color={'#3f51b5'}
              />
            </div>
            <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>记录了工作日志</span>
          </div>
          <div className="c7n-action">
            <Icon
              role="none"
              type="mode_edit mlr-3 pointer"
              onClick={() => {
                this.setState({
                  editLogId: worklog.logId,
                  editLog: worklog.description,
                  expand: true,
                });
              }}
            />
            <Popconfirm
              title="确认要删除该工作日志吗?"
              placement="left"
              onConfirm={this.confirm.bind(this, worklog.logId)}
              onCancel={this.cancel}
              okText="删除"
              cancelText="取消"
              okType="danger"
            >
              <Icon
                type="delete_forever mlr-3 pointer"
              />
            </Popconfirm>
          </div>
        </div>
        <div className="line-start" style={{ color: 'rgba(0, 0, 0, 0.65)', marginTop: 2 }}>
          - {formatDate(worklog.lastUpdateDate)}
        </div>
        <div className="line-start" style={{ color: 'rgba(0, 0, 0, 0.65)', marginTop: '10px', marginBottom: '10px' }}>
          <span style={{ width: 70 }}>耗费时间:</span>
          <span style={{ color: '#000', fontWeight: '500' }}>{`${worklog.workTime}h` || '无'}</span>
        </div>
        {
          this.state.expand && (
            <div>
              <div className="c7n-conent-log" style={{ marginTop: 10, display: 'flex' }}>
                <span style={{ width: 70, flexShrink: 0, color: 'rgba(0, 0, 0, 0.65)' }}>备注:</span>
                <span style={{ flex: 1 }}>
                  {
                    worklog.logId !== this.state.editLogId ? (
                      <IssueDescription data={delta2Html(worklog.description)} />
                    ) : null
                  }
                </span>
              </div>
              {
                worklog.logId === this.state.editLogId ? (
                  <WYSIWYGEditor
                    bottomBar
                    value={deltaEdit}
                    style={{ height: 200, width: '100%' }}
                    onChange={(value) => {
                      this.setState({ editLog: value });
                    }}
                    handleDelete={() => {
                      this.setState({
                        editLogId: undefined,
                        editLog: undefined,
                      });
                    }}
                    handleSave={this.handleUpdateLog.bind(this, worklog)}
                  />
                ) : null
              }
            </div>
          )
        }
        
      </div>
    );
  }
}

export default Log;
