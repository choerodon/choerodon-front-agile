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
import DataLog from './DataLog';

const PROP = {
  Sprint: '冲刺',
  status: '状态',
  resolution: '',
  'Story Points': '故事点',
};

class DataLogs extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      user: {},
    };
  }

  componentDidMount() {
  }

  setUser(user) {
    this.setState({
      user,
    });
  }

  render() {
    const { datalogs } = this.props;
    return (
      <div>
        {
          datalogs.map((datalog, i) => (
            <DataLog
              i={i}
              datalog={datalog}
              origin={datalogs}
              user={this.state.user}
              callback={this.setUser.bind(this)}
            />
          ))
        }
      </div>
    );
  }
}

export default DataLogs;
