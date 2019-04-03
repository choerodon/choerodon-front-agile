import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Input } from 'choerodon-ui';
import { injectIntl } from 'react-intl';
import TextEditToggle from '../../../../../../../../components/TextEditToggle';
import { updateIssue } from '../../../../../../../../api/NewIssueApi';

const { Text, Edit } = TextEditToggle;
const { TextArea } = Input;

@inject('AppState')
@observer class FieldText extends Component {
  constructor(props) {
    super(props);
    this.TextEditToggle = undefined;
    this.state = {
      newValue: undefined,
    };
  }

  componentDidMount() {
  }

  updateIssueField = () => {
    const { newValue } = this.state;
    const {
      store, onUpdate, reloadIssue, field,
    } = this.props;
    const { code } = field;
    const issue = store.getIssue;
    const { issueId, objectVersionNumber, [code]: value } = issue;
    if (newValue && newValue.trim() && value !== newValue.trim()) {
      const obj = {
        issueId,
        objectVersionNumber,
        [code]: newValue.trim(),
      };
      updateIssue(obj)
        .then(() => {
          if (onUpdate) {
            onUpdate();
          }
          if (reloadIssue) {
            reloadIssue();
          }
        });
    }
  };

  render() {
    const { store, field } = this.props;
    const { code, name } = field;
    const issue = store.getIssue;
    const { [code]: value } = issue;
    return (
      <div className="line-start mt-10">
        <div className="c7n-property-wrapper">
          <span className="c7n-property">
            {`${name}：`}
          </span>
        </div>
        <div className="c7n-value-wrapper">
          <TextEditToggle
            ref={(e) => { this.TextEditToggle = e; }}
            formKey={code}
            onSubmit={this.updateIssueField}
            originData={value}
          >
            <Text>
              <div>
                {value || '无'}
              </div>
            </Text>
            <Edit>
              <TextArea
                autosize
                maxLength={44}
                size="small"
                onChange={(e) => {
                  this.setState({
                    newValue: e.target.value,
                  });
                }}
                onPressEnter={() => {
                  this.updateIssueField();
                  if (this.TextEditToggle && this.TextEditToggle.leaveEditing) {
                    this.TextEditToggle.leaveEditing();
                  }
                }}
              />
            </Edit>
          </TextEditToggle>
        </div>
      </div>
    );
  }
}

export default withRouter(injectIntl(FieldText));
