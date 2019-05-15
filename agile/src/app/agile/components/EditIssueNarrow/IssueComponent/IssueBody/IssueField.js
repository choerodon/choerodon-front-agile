import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import {
  Field, FieldAssignee, FieldVersion, FieldStatus, FieldSprint, FieldText,
  FieldReporter, FieldPriority, FieldLabel, FieldFixVersion, FieldPI,
  FieldEpic, FieldDateTime, FieldComponent, FieldTimeTrace, FieldStoryPoint,
  FieldSummary, FieldInput,
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
    const { typeCode } = issue;
    switch (field.fieldCode) {
      case 'assignee':
        return (<FieldAssignee {...this.props} />);
      case 'influenceVersion':
        return (<FieldVersion {...this.props} />);
      case 'status':
        return (<FieldStatus {...this.props} />);
      case 'sprint':
        if (typeCode !== 'sub_task') {
          return (<FieldSprint {...this.props} />);
        } else {
          return (<FieldSprint {...this.props} disabled />);
        }
      case 'reporter':
        return (<FieldReporter {...this.props} />);
      case 'priority':
        return (<FieldPriority {...this.props} />);
      case 'label':
        return (<FieldLabel {...this.props} />);
      case 'fixVersion':
        return (<FieldFixVersion {...this.props} />);
      case 'epic':
        // 子任务、史诗不显示史诗
        if (['issue_epic', 'sub_task'].indexOf(typeCode) === -1) {
          return (<FieldEpic {...this.props} />);
        }
        return '';
      case 'creationDate':
      case 'lastUpdateDate':
        return (<FieldDateTime {...this.props} field={field} />);
      case 'component':
        if (typeCode !== 'sub_task') {
          return (<FieldComponent {...this.props} />);
        }
        return '';
      case 'timeTrace':
        return (<FieldTimeTrace {...this.props} />);
      case 'pi':
        return (<FieldPI {...this.props} />);
      case 'benfitHypothesis':
      case 'acceptanceCritera':
        return (<FieldText {...this.props} field={field} feature />);
      case 'summary':
        return (<FieldSummary {...this.props} field={field} />);
      case 'epicName':
        return (<FieldInput {...this.props} field={field} />);
      case 'remainingTime':
      case 'storyPoints':
        return (<FieldStoryPoint {...this.props} field={field} />);
      default:
        return (<Field {...this.props} field={field} />);
    }
  };

  render() {
    const { store, isWide = false } = this.props;
    const issue = store.getIssue;
    const fields = store.getFields;
    const { issueId } = issue;

    const left = [];
    const right = [];
    if (issueId && isWide) {
      fields.forEach((item, index) => {
        if (index < fields.length / 2) {
          left.push(item);
        } else {
          right.push(item);
        }
      });
    }

    return (
      <div className="c7n-content-wrapper">
        {!isWide && issueId ? fields.map(field => (
          <span
            className="c7n-content-item"
            key={field.fieldCode}
          >
            {this.getFieldComponent(field)}
          </span>
        )) : ''}
        {isWide && issueId ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ flex: 1 }}>
              {
                left.map(field => (
                  <span
                    className="c7n-content-item"
                    key={field.fieldCode}
                  >
                    {this.getFieldComponent(field)}
                  </span>
                ))
              }
            </span>
            <span style={{ flex: 1 }}>
              {
                right.map(field => (
                  <span
                    className="c7n-content-item"
                    key={field.fieldCode}
                  >
                    {this.getFieldComponent(field)}
                  </span>
                ))
              }
            </span>
          </div>
        ) : ''}
      </div>
    );
  }
}

export default withRouter(injectIntl(IssueField));
