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
    switch (field.fieldCode) {
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
        return (<Field {...this.props} field={field} />);
    }
  };

  render() {
    const { store } = this.props;
    const issue = store.getIssue;
    const fields = store.getFields;
    const { issueId } = issue;

    return (
      <div className="c7n-content-wrapper">
        {issueId ? fields.map(field => (
          <span
            className="c7n-content-item"
            key={field.fieldCode}
          >
            {this.getFieldComponent(field)}
          </span>
        )) : ''}
      </div>
    );
  }
}

export default withRouter(injectIntl(IssueField));
