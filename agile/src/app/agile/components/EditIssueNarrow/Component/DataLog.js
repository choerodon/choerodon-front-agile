import React, { Component } from 'react';
import { Icon, Popconfirm } from 'choerodon-ui';
import { AppState } from 'choerodon-front-boot';
import _ from 'lodash';
import UserHead from '../../UserHead';
import WYSIWYGEditor from '../../WYSIWYGEditor';
import { IssueDescription } from '../../CommonComponent';
import { delta2Html, text2Delta, beforeTextUpload, formatDate } from '../../../common/utils';
import { deleteWorklog, updateWorklog } from '../../../api/NewIssueApi';
import { getUser } from '../../../api/CommonApi';
import './DataLog.scss';

const PROP = {
  Sprint: '冲刺',
  status: '状态',
  'Story Points': '故事点',
  timeestimate: '剩余时间',
  summary: '问题概要',
  'Epic Name': '史诗名',
  priority: '优先级',
  // Component: '模块',
  labels: '标签',
  'Epic Link': '史诗',
  assignee: '经办人',
  reporter: '报告人',
};
const PROP_SIMPLE = {
  Component: '模块',
  'Fix Version': '修复版本',
  'Epic Child': '史诗关联任务',
  description: '描述',
  Attachment: '附件',
  timespent: '花费时间',
  WorklogId: '工作日志',
  issuetype: '类型',
  Rank: '排序',
  resolution: '解决方案',
  Comment: '评论',
};

class DataLog extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      user: {},
    };
  }

  componentDidMount() {
    // this.loadUser();
  }

  transform() {

  }

  loadUser() {
    const { datalog, i, origin, user, callback } = this.props;
    if (i && origin[i].lastUpdatedBy === origin[i - 1].lastUpdatedBy) {
      this.setState({
        user,
      });
    } else {
      getUser(datalog.lastUpdatedBy)
        .then((res) => {
          this.setState({ user: res });
          callback(res);
        });
    }
  }

  render() {
    const { datalog, i, origin, user, callback, expand } = this.props;
    return (
      <div>
        {
          i > 4 && !expand ? null : (
            <div className="c7n-datalog">
              <div className="line-justify">
                <div className="c7n-title-log" style={{ flexShrink: 0 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      marginRight: 15,
                    }}
                  >
                    {
                      i && origin[i].lastUpdatedBy === origin[i - 1].lastUpdatedBy ? null : (
                        <UserHead
                          user={{
                            id: datalog.lastUpdatedBy,
                            loginName: '',
                            realName: datalog.name,
                            avatar: datalog.imageUrl,
                          }}
                          hiddenText
                          type={'datalog'}
                        />
                      )
                    }
              
                  </div>
                </div>
                <div style={{ flex: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.12)', padding: '8.5px 0' }}>
                  <div>
                    <span style={{ color: '#303f9f' }}>
                      {datalog.name}
                    </span>
                    {
                      PROP[datalog.field] ? (
                        <div style={{ display: 'inline' }}>
                    将
                          <span style={{ fontWeight: 'bold' }}>
                            {` ${PROP[datalog.field] || datalog.field} `}
                          </span>
                    由 {datalog.oldString || '无'} 改为 {datalog.newString || '无'}
                        </div>
                      ) : (
                        <div style={{ display: 'inline' }}>
                    修改了
                          <span style={{ fontWeight: 'bold' }}>
                            {` ${PROP_SIMPLE[datalog.field] || datalog.field} `}
                          </span>
                        </div>
                      )
                    }
                  </div>
                  <div style={{ marginTop: 5 }}>- {formatDate(datalog.lastUpdateDate)}</div>
                </div>
              </div>
            </div>
          )
        }
      </div>
    );
  }
}

export default DataLog;
