import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Select } from 'choerodon-ui';
import { injectIntl } from 'react-intl';
import TextEditToggle from '../../../../../../../../components/TextEditToggle';
import { updateIssue } from '../../../../../../../../api/NewIssueApi';

const { Option } = Select;
const { Text, Edit } = TextEditToggle;
const defaultList = ['0.5', '1', '2', '3', '4', '5', '8', '13'];

@inject('AppState')
@observer class FieldStoryPoint extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newValue: undefined,
    };
  }

  componentDidMount() {
  }

  handleChange = (value) => {
    const { newValue } = this.state;
    // 只允许输入整数，选择时可选0.5
    if (value === '0.5') {
      this.setState({
        newValue: '0.5',
      });
    } else if (/^(0|[1-9][0-9]*)(\[0-9]*)?$/.test(value) || value === '') {
      this.setState({
        newValue: String(value).slice(0, 3), // 限制最长三位,
      });
    } else if (value.toString().charAt(value.length - 1) === '.') {
      this.setState({
        newValue: value.slice(0, -1),
      });
    } else {
      this.setState({
        newValue,
      });
    }
  };

  updateIssueField = () => {
    const { newValue } = this.state;
    const {
      store, onUpdate, reloadIssue, field,
    } = this.props;
    const issue = store.getIssue;
    const { code } = field;

    const {
      issueId, objectVersionNumber, [code]: oldValue,
    } = issue;
    if (oldValue !== newValue) {
      const obj = {
        issueId,
        objectVersionNumber,
        [code]: newValue === '' ? null : newValue,
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
    const { newValue } = this.state;
    const { store, field } = this.props;
    const issue = store.getIssue;
    const { code, name } = field;
    const { [code]: value } = issue;

    return (
      <div className="line-start mt-10">
        <div className="c7n-property-wrapper" style={{ width: 120 }}>
          <span className="c7n-property">
            {`${name}：`}
          </span>
        </div>
        <div className="c7n-value-wrapper">
          <TextEditToggle
            onSubmit={this.updateIssueField}
          >
            <Text>
              <div>
                {value ? `${value} ${code === 'storyPoint' ? '点' : '小时'}` : '无'}
              </div>
            </Text>
            <Edit>
              <Select
                value={newValue && newValue.toString()}
                mode="combobox"
                style={{ marginTop: 0, paddingTop: 0 }}
                onChange={e => this.handleChange(e)}
              >
                {defaultList.map(sp => (
                  <Option key={sp.toString()} value={sp}>
                    {sp}
                  </Option>
                ))}
              </Select>
            </Edit>
          </TextEditToggle>
        </div>
      </div>
    );
  }
}

export default withRouter(injectIntl(FieldStoryPoint));
