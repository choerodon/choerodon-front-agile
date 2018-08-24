import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Input } from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import './EpicCard.scss';
import StatusTag from '../../../../../components/StatusTag';
import { updateIssue } from '../../../../../api/NewIssueApi';
import US from '../../../../../stores/project/userMap/UserMapStore';

const { AppState } = stores;
const { TextArea } = Input;

class EpicCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      epicName: '',
      originEpicName: '',
    };
    this.isEnter = false;
  }

  componentDidMount() {
    this.setEpicNameInState();
  }

  setEpicNameInState() {
    const { epic } = this.props;
    const { epicName } = epic;
    this.setState({
      epicName,
      originEpicName: epicName,
    });
  }

  handleEpicNameChange = (e) => {
    this.setState({ epicName: e.target.value });
  };

  handlePressEnter = (e) => {
    e.preventDefault();
    const target = e.target;
    if (!this.state.epicName) {
      return;
    }
    target.blur();
  };

  updateEpicName = (e) => {
    if (!this.state.epicName) {
      this.setState({
        epicName: this.state.originEpicName,
      });
    }
    if (this.state.epicName === this.state.originEpicName) return;
    e.preventDefault();
    const { epic } = this.props;
    const { issueId, objectVersionNumber } = epic;
    if (!this.state.epicName) return;
    const obj = {
      issueId,
      objectVersionNumber,
      epicName: this.state.epicName,
    };
    updateIssue(obj).then((res) => {
      this.setState({
        isEdit: false,
      });
      US.modifyEpic(issueId, res.objectVersionNumber);
      if (this.props.handleUpdateEpicName) {
        this.props.handleUpdateEpicName();
      }
    });
  };

  render() {
    const { epic } = this.props;
    const progress = !epic.issueCount ? 0 : epic.doneIssueCount / epic.issueCount;
    return (
      <Draggable draggableId={this.props.index} index={this.props.index}>
        {(provided1, snapshot1) => (
          <div
            ref={provided1.innerRef}
            {...provided1.draggableProps}
            {...provided1.dragHandleProps}
            style={{
              marginRight: 10,
              background: 'white',
              paddingLeft: 0,
              cursor: 'move',
              ...provided1.draggableProps.style,
            }}
            role="none"
          >
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
                    width: `${100 - progress * 100}%`,
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
                  <StatusTag name={epic.statusName} color={epic.statusColor} />
                  <span className="c7n-issueCount">{epic.totalEstimate}</span>
                </div>
                <span
                  className="c7n-issueNum"
                  role="none"
                  onClick={() => {
                    const { history } = this.props;
                    const urlParams = AppState.currentMenuType;
                    history.push(
                      `/agile/issue?type=${urlParams.type}&id=${urlParams.id}&name=${
                        urlParams.name
                        }&organizationId=${urlParams.organizationId}&paramName=${
                        epic.issueNum
                        }&paramIssueId=${epic.issueId}&paramUrl=usermap`,
                    );
                  }}
                >
            {epic.issueNum}
          </span>
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  }
}
export default withRouter(EpicCard);
