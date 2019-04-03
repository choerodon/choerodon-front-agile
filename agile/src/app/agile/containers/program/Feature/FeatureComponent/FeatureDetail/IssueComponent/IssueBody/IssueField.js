import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import { returnBeforeTextUpload } from '../../../../../../../common/utils';
import { updateStatus, updateIssue } from '../../../../../../../api/NewIssueApi';
import { DatetimeAgo } from '../../../../../../../components/CommonComponent';
import { STATUS } from '../../../../../../../common/Constant';
import { getSelf } from '../../../../../../../api/CommonApi';
import UserHead from '../../../../../../../components/UserHead';
import {
  Field, FieldAssignee, FieldVersion, FieldStatus, FieldSprint, FieldText,
  FieldReporter, FieldPriority, FieldLabel, FieldFixVersion, FieldPI,
  FieldEpicName, FieldEpic, FieldDateTime, FieldComponent, FieldTimeTrace,
} from './Field';

const readOnly = ['creationDate', 'lastUpdateDate', 'pi'];

@inject('AppState')
@observer class IssueField extends Component {
  constructor(props) {
    super(props);
    this.sign = false;
    this.state = {
      nav: 'detail',
      currentRae: '',
    };
  }

  componentDidMount() {

  }

  changeRae = (data) => {
    this.setState({
      currentRae: data,
    });
  };

  getFieldComponent = (field) => {
    const { store } = this.props;
    const issue = store.getIssue;
    switch (field.code) {
      case 'assignee':
        return (<FieldAssignee {...this.props} />);
      case 'influenceVersion':
        return (<FieldVersion {...this.props} />);
      case 'status':
        return (<FieldStatus {...this.props} />);
      case 'sprint':
        return (<FieldSprint {...this.props} />);
      case 'reporter':
        return (<FieldReporter {...this.props} />);
      case 'priority':
        return (<FieldPriority {...this.props} />);
      case 'label':
        return (<FieldLabel {...this.props} />);
      case 'version':
        return (<FieldFixVersion {...this.props} />);
      case 'epicName':
        return (<FieldEpicName {...this.props} />);
      case 'epic':
        return (<FieldEpic {...this.props} />);
      case 'creationDate':
      case 'lastUpdateDate':
        return (<FieldDateTime {...this.props} field={field} />);
      case 'component':
        return (<FieldComponent {...this.props} />);
      case 'timeTrace':
        return (<FieldTimeTrace {...this.props} />);
      case 'pi':
        return (<FieldPI {...this.props} />);
      case 'benfitHypothesis':
      case 'acceptanceCritera':
      case 'summary':
        return (<FieldText {...this.props} field={field} />);
      default:
        return (<Field {...this.props} />);
    }
  };

  handleFieldChange = (field, value) => {
    const { state } = this;
    const { onUpdate, store, reloadIssue } = this.props;
    const { code, system } = field;
    const issue = store.getIssue;
    const {
      issueId, objectVersionNumber,
    } = issue;

    const obj = {
      issueId,
      objectVersionNumber,
    };
    if ((code === 'description') || (code === 'editDes')) {
      if (state[code]) {
        returnBeforeTextUpload(state[code], obj, updateIssue, 'description')
          .then((res) => {
            this.reloadIssue(state.origin.issueId);
          });
      }
    } else if (code === 'assigneeId') {
      obj[code] = state[code] ? JSON.parse(state[code]).id || 0 : 0;
      updateIssue(obj)
        .then((res) => {
          if (reloadIssue) {
            reloadIssue();
          }
          if (onUpdate) {
            onUpdate();
          }
        });
    } else if (code === 'reporterId') {
      obj[code] = value || 0;
      updateIssue(obj)
        .then((res) => {
          if (reloadIssue) {
            reloadIssue();
          }
          if (onUpdate) {
            onUpdate();
          }
        });
    } else if (code === 'statusId') {
      if (value) {
        updateStatus(value, issueId, objectVersionNumber)
          .then((res) => {
            if (reloadIssue) {
              reloadIssue();
            }
            if (onUpdate) {
              onUpdate();
            }
            this.setState({
              transformId: false,
            });
          });
      }
    } else {
      obj[code] = state[code] || 0;
      updateIssue(obj)
        .then((res) => {
          if (reloadIssue) {
            reloadIssue();
          }
          if (onUpdate) {
            onUpdate();
          }
        });
    }
  };

  onInit = () => {

  };

  setCurrentRae = (data) => {
    const { store } = this.props;
    store.setCurrentRae(data);
  };

  render() {
    const { store } = this.props;
    const issue = store.getIssue;
    const {
      statusMapDTO = {}, activePi = {}, epicName, reporterName,
      featureDTO = {}, creationDate, lastUpdateDate, assigneeId,
      reporterId, reporterImageUrl, issueId,
    } = issue;

    const fields = [
      {
        code: 'status',
        name: '状态',
        system: true,
        required: true,
        type: 'select',
      }, {
        code: 'priority',
        name: '优先级',
        system: true,
        required: true,
      }, {
        code: 'component',
        name: '模块',
        system: true,
        required: true,
      }, {
        code: 'label',
        name: '标签',
        system: true,
        required: true,
      }, {
        code: 'influenceVersion',
        name: '影响的版本',
        system: true,
        required: true,
      }, {
        code: 'fixVersion',
        name: '版本',
        system: true,
        required: true,
      }, {
        code: 'epic',
        name: '史诗',
        system: true,
        required: true,
      }, {
        code: 'sprint',
        name: '冲刺',
        system: true,
        required: true,
      }, {
        code: 'epicName',
        name: '史诗名称',
        system: true,
        required: true,
      }, {
        code: 'reporter',
        name: '报告人',
        system: true,
        required: true,
      }, {
        code: 'assignee',
        name: '经办人',
        system: true,
        required: true,
      }, {
        code: 'creationDate',
        name: '创建时间',
        system: true,
        required: true,
      }, {
        code: 'lastUpdateDate',
        name: '更新时间',
        system: true,
        required: true,
      }, {
        code: 'benfitHypothesis',
        name: '特性价值',
        system: true,
        required: true,
      }, {
        code: 'acceptanceCritera',
        name: '验收标准',
        system: true,
        required: true,
      }, {
        code: 'featureType',
        name: '特性类型',
        system: true,
        required: true,
      },
    ];

    const featureFields = [
      {
        code: 'status',
        name: '状态',
        system: true,
        required: true,
        type: 'select',
      }, {
        code: 'pi',
        name: 'PI',
        system: true,
        required: true,
      }, {
        code: 'epic',
        name: '史诗',
        system: true,
        required: true,
      }, {
        code: 'reporter',
        name: '报告人',
        system: true,
        required: true,
      }, {
        code: 'benfitHypothesis',
        name: '特性价值',
        system: true,
        required: true,
      }, {
        code: 'acceptanceCritera',
        name: '验收标准',
        system: true,
        required: true,
      }, {
        code: 'creationDate',
        name: '创建时间',
        system: true,
        required: true,
        value: creationDate,
      }, {
        code: 'lastUpdateDate',
        name: '更新时间',
        system: true,
        required: true,
      },
    ];

    return (
      <div className="c7n-content-wrapper">
        {issueId ? featureFields.map(field => (<span key={field.code}>{this.getFieldComponent(field)}</span>)) : ''}
      </div>
    );
  }
}

export default withRouter(injectIntl(IssueField));
