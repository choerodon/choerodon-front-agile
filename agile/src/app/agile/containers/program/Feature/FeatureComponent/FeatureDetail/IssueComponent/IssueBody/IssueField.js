import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import {
  Field, FieldAssignee, FieldVersion, FieldStatus, FieldSprint, FieldText,
  FieldReporter, FieldPriority, FieldLabel, FieldFixVersion, FieldPI,
  FieldEpic, FieldDateTime, FieldComponent, FieldTimeTrace, FieldStoryPoint,
} from './Field';

@inject('AppState')
@observer class IssueField extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

  }

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
      case 'fixVersion':
        return (<FieldFixVersion {...this.props} />);
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
        return (<FieldText {...this.props} field={field} feature />);
      case 'summary':
      case 'epicName':
        return (<FieldText {...this.props} field={field} />);
      case 'estimateTime':
      case 'storyPoints':
        return (<FieldStoryPoint {...this.props} field={field} />);
      default:
        return (<Field {...this.props} />);
    }
  };

  render() {
    const { store } = this.props;
    const issue = store.getIssue;
    const { issueId, typeCode } = issue;

    // 22
    const create = [
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
        code: 'pi',
        name: 'PI',
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
        code: 'timeTrace',
        name: '时间跟踪',
        system: true,
        required: true,
      }, {
        code: 'summary',
        name: '概要',
        system: true,
        required: true,
      }, {
        code: 'estimateTime',
        name: '预估时间',
        system: true,
        required: true,
      }, {
        code: 'storyPoints',
        name: '故事点',
        system: true,
        required: true,
      }, {
        code: 'issueType',
        name: '问题类型',
        system: true,
        required: true,
      }, {
        code: 'description',
        name: '描述',
        system: true,
        required: true,
      },
    ];

    // 20
    const detail = [
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
        code: 'pi',
        name: 'PI',
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
        code: 'timeTrace',
        name: '时间跟踪',
        system: true,
        required: true,
      }, {
        code: 'estimateTime',
        name: '预估时间',
        system: true,
        required: true,
      }, {
        code: 'storyPoints',
        name: '故事点',
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
      }, {
        code: 'lastUpdateDate',
        name: '更新时间',
        system: true,
        required: true,
      },
    ];
    const fields = typeCode === 'feature' ? featureFields : detail;
    return (
      <div className="c7n-content-wrapper">
        {issueId ? fields.map(field => (<span key={field.code}>{this.getFieldComponent(field)}</span>)) : ''}
      </div>
    );
  }
}

export default withRouter(injectIntl(IssueField));
