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
  resolution: '',
  'Story Points': '故事点',
};

class DataLog extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      user: {},
    };
  }

  componentDidMount() {
    const { datalog, i, origin } = this.props;
    getUser(datalog.lastUpdatedBy).then(res => this.setState({ user: res }));
  }

  render() {
    const { datalog, i, origin } = this.props;
    return (
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
                      id: this.state.user.id,
                      loginName: this.state.user.loginName,
                      realName: this.state.user.realName,
                      avatar: this.state.user.imageUrl,
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
                {`${this.state.user.loginName} ${this.state.user.realName} `}
              </span>
              将
              <span style={{ fontWeight: 'bold' }}>
                {` ${PROP[datalog.field] || datalog.field} `}
              </span>
              由 {datalog.oldString || '无'} 改为 {datalog.newString || '无'}</div>
            <div style={{ marginTop: 5 }}>- {formatDate(datalog.lastUpdateDate)}</div>
          </div>
        </div>
        {/* <div className="line-start" style={{ color: 'rgba(0, 0, 0, 0.65)', marginTop: 2 }}>
          - {formatDate(worklog.lastUpdateDate)}
        </div> */}
      </div>
    );
  }
}

export default DataLog;
