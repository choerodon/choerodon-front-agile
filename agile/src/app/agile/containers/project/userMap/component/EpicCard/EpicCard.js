import React, { Component } from 'react';
import { Input } from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
import './EpicCard.scss';
import StatusTag from '../../../../../components/StatusTag';
import { updateIssue } from '../../../../../api/NewIssueApi';

const { AppState } = stores;
const { TextArea } = Input;

class EpicCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      epicName: '',
    };
    this.isEnter = false;
  }

  componentDidMount() {
    this.setEpicNameInState();
  }

  setEpicNameInState() {
    const { epic } = this.props;
    const { epicName } = epic;
    this.setState({ epicName });
  }

  handleEpicNameChange = (e) => {
    this.setState({ epicName: e.target.value });
  }

  handlePressEnter = (e) => {
    this.isEnter = true;
    e.preventDefault();
    const target = e.target;
    const { epic } = this.props;
    const { issueId, objectVersionNumber } = epic;
    const obj = {
      issueId,
      objectVersionNumber,
      epicName: this.state.epicName,
    };
    updateIssue(obj)
      .then((res) => {
        this.setState({ isEdit: false });
        if (this.props.handleUpdateEpicName) {
          this.props.handleUpdateEpicName();
        }
        target.blur();
      });
  }

  updateEpicName = (e) => {
    if (this.isEnter) {
      this.isEnter = false;
      return;
    }
    e.preventDefault();
    const target = e.target;
    const { epic } = this.props;
    const { issueId, objectVersionNumber } = epic;
    const obj = {
      issueId,
      objectVersionNumber,
      epicName: this.state.epicName,
    };
    updateIssue(obj)
      .then((res) => {
        this.setState({ isEdit: false });
        if (this.props.handleUpdateEpicName) {
          this.props.handleUpdateEpicName();
        }
      });
  }

  render() {
    const { epic } = this.props;
    return (
      <div className="c7n-userMap-epicCard">
        <div className="c7n-progress">
          <div
            className="c7n-bar"
            style={{
              background: epic.color,
              width: '30%',
            }}
          />
          <div
            className="c7n-bar-bg"
            style={{
              background: epic.color,
              width: '70%',
            }}
          />
        </div>
        <div className="c7n-content">
          <TextArea
            className="c7n-textArea"
            autosize={{ minRows: 1, maxRows: 2 }}
            value={this.state.epicName}
            onChange={this.handleEpicNameChange.bind(this)}
            onPressEnter={this.handlePressEnter}
            onFocus={e => e.target.select()}
            onBlur={this.updateEpicName}
          />
        </div>
        <div className="c7n-footer">
          <div className="c7n-footer-left">
            <StatusTag
              name={epic.statusName}
              color={epic.statusColor}
            />
            <span className="c7n-issueCount">{epic.totalEstimate}</span>
          </div>
          <span
            className="c7n-issueNum"
            role="none"
            onClick={() => {
              const { history } = this.props;
              const urlParams = AppState.currentMenuType;
              history.push(`/agile/issue?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}&paramName=${epic.issueNum}&paramIssueId=${epic.issueId}&paramUrl=usermap`);
            }}
          >
            {epic.issueNum}
          </span>
        </div>
      </div>
    );
  }
}
export default EpicCard;
