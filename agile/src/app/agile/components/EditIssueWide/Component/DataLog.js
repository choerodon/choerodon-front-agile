import React, { Component } from 'react';
import { Icon, Popconfirm } from 'choerodon-ui';
import { AppState } from 'choerodon-front-boot';
import _ from 'lodash';
import UserHead from '../../UserHead';
import WYSIWYGEditor from '../../WYSIWYGEditor';
import { IssueDescription } from '../../CommonComponent';
import { delta2Html, text2Delta, beforeTextUpload, formatDate } from '../../../common/utils';
import { deleteWorklog, updateWorklog } from '../../../api/NewIssueApi';
import './DataLog.scss';


class DataLog extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
    };
  }

  componentDidMount() {
  }

  render() {
    const { dataLog } = this.props;
    return (
      <div className="c7n-datalog">
        <div className="line-justify">
          <div className="c7n-title-log" style={{ flexShrink: 0 }}>
            <div
              style={{
                width: 40,
                height: 40,
                background: '#b3bac5',
                borderRadius: '4px',
                marginRight: 15,
              }}
            />
          </div>
          <div style={{ flex: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.12)', padding: '8.5px 0' }}>
            <div>12938李洪 更新 C7NA-56 的范围</div>
            <div>- 22/五月/18 3:44 下午 </div>
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
