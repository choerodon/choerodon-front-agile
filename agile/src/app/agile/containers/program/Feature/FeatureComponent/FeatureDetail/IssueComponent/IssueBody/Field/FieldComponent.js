import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Select } from 'choerodon-ui';
import { injectIntl } from 'react-intl';
import TextEditToggle from '../../../../../../../../components/TextEditToggle';
import { STATUS } from '../../../../../../../../common/Constant';
import { loadStatus, updateStatus } from '../../../../../../../../api/NewIssueApi';

const { Option } = Select;
const { Text, Edit } = TextEditToggle;

@inject('AppState')
@observer class FieldComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      originStatus: [],
      selectLoading: true,
      transformId: undefined,
      newStatusId: undefined,
    };
  }

  componentDidMount() {
    this.loadIssueStatus();
  }

  transToArr = (arr, pro, type = 'string') => {
    if (!arr.length) {
      return type === 'string' ? '无' : [];
    } else if (typeof arr[0] === 'object') {
      return type === 'string' ? _.map(arr, pro).join() : _.map(arr, pro);
    } else {
      return type === 'string' ? arr.join() : arr;
    }
  }

  loadIssueStatus = () => {
    const { store } = this.props;
    const issue = store.getIssue;
    const {
      issueTypeDTO = {},
      issueId,
      statusId,
    } = issue;
    const typeId = issueTypeDTO.id;
    loadStatus(statusId, issueId, typeId, 'program').then((res) => {
      this.setState({
        originStatus: res,
        selectLoading: false,
        newStatusId: statusId,
      });
    });
  };

  updateIssueStatus = () => {
    const { transformId } = this.state;
    const { store, onUpdate, reloadIssue } = this.props;
    const issue = store.getIssue;
    const { issueId, objectVersionNumber } = issue;
    updateStatus(transformId, issueId, objectVersionNumber, 'programe')
      .then(() => {
        if (onUpdate) {
          onUpdate();
        }
        if (reloadIssue) {
          reloadIssue();
        }
        this.setState({
          transformId: undefined,
        });
      });
  };

  render() {
    const { selectLoading, originStatus } = this.state;
    const { store, hasPermission } = this.props;
    const issue = store.getIssue;
    const { componentIssueRelDTOList = {}, statusId } = issue;
    return (
      <div className="line-start mt-10">
        <div className="c7n-property-wrapper">
          <span className="c7n-property">
            {'模块：'}
          </span>
        </div>
        <div className="c7n-value-wrapper">
          <TextEditToggle
            formKey="component"
            onSubmit={this.updateIssueStatus}
            originData={componentIssueRelDTOList.map(component => component.id)}
          >
            <Text>
              <div style={{ color: '#3f51b5' }}>
                <p style={{ color: '#3f51b5', wordBreak: 'break-word', marginTop: 2 }}>
                  {this.transToArr(componentIssueRelDTOList, 'name')}
                </p>
              </div>
            </Text>
            <Edit>
              <Select
                value={this.transToArr(componentIssueRelDTOList, 'name', 'array')}
                loading={selectLoading}
                ref={(e) => {
                  this.componentRef = e;
                }}
                mode={hasPermission ? 'tags' : 'multiple'}
                onPopupFocus={(e) => {
                  this.componentRef.rcSelect.focus();
                }}
                getPopupContainer={triggerNode => triggerNode.parentNode}
                tokenSeparators={[',']}
                style={{ width: '200px', marginTop: 0, paddingTop: 0 }}
                onFocus={() => {
                  this.setState({
                    selectLoading: true,
                  });
                  loadComponents().then((res) => {
                    this.setState({
                      originComponents: res.content,
                      selectLoading: false,
                    });
                  });
                }}
                onChange={(value) => {
                  this.setState({
                    componentIssueRelDTOList: value.filter(v => v && v.trim()).map(
                      item => item.trim().substr(0, 10),
                    ),
                  });
                }}
              >
                {originComponents && originComponents.map(component => (
                  <Option
                    key={component.name}
                    value={component.name}
                  >
                    {component.name}
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

export default withRouter(injectIntl(FieldComponent));
