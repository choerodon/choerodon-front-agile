import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Input } from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
import { Draggable } from 'react-beautiful-dnd';
import './EpicCard.scss';
import StatusTag from '../../../../../components/StatusTag';
import TypeTag from '../../../../../components/TypeTag';
import { updateIssue } from '../../../../../api/NewIssueApi';
import US from '../../../../../stores/project/userMap/UserMapStore';

const { AppState } = stores;
const { TextArea } = Input;

class EpicCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      epicName: '',
      originEpicName: '',
      isEdit: false,
    };
  }

  componentDidMount() {
    this.setEpicNameInState();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { epic, epic: { issueId, objectVersionNumber }, index } = this.props;
    const { epicName, isEdit } = this.state;
    if (nextProps.epic.issueId === issueId
      && nextProps.epic.epicName === epic.epicName
      && nextProps.epic.objectVersionNumber === objectVersionNumber
      && nextProps.index === index
      && nextState.epicName === epicName
      && nextState.isEdit === isEdit
    ) {
      return false;
    }
    return true;
  }

  setEpicNameInState(ep) {
    let e = ep;
    if (!e) {
      const { epic } = this.props;
      e = epic;
    }
    const { epicName } = e;
    this.setState({
      epicName,
      originEpicName: epicName,
    });
  }

  handleClickTextArea = (e) => {
    if (e.defaultPrevented) return;
    
    const { isEdit } = this.state;
    if (!isEdit) {
      const { target } = e;
      target.focus();
      target.select();
      this.setState({ isEdit: true });
    }
  }

  handleEpicNameChange = (e) => {
    this.setState({ epicName: e.target.value });
  };

  handlePressEnter = (e) => {
    e.preventDefault();
    const { target } = e;
    const { epicName } = this.state;
    if (!epicName) {
      return;
    }
    target.blur();
  };

  updateEpicName = (e) => {
    const { epicName, originEpicName } = this.state;
    const { handleUpdateEpicName } = this.props;

    this.setState({ isEdit: false });
    if (!epicName) {
      this.setState({
        epicName: originEpicName,
      });
    }
    if (epicName === originEpicName) return;
    e.preventDefault();
    const { epic } = this.props;
    const { issueId, objectVersionNumber } = epic;
    if (!epicName) return;
    const obj = {
      issueId,
      epicName,
      objectVersionNumber,
    };
    updateIssue(obj).then((res) => {
      this.setState({
        isEdit: false,
      });
      US.modifyEpic(issueId, res.epicName, res.objectVersionNumber);
      if (handleUpdateEpicName) {
        handleUpdateEpicName();
      }
    });
  };

  render() {
    const { epic, index } = this.props;
    const { isEdit, epicName } = this.state;
    const progress = !epic.issueCount ? 0 : epic.doneIssueCount / epic.issueCount;
    return (
      <Draggable
        draggableId={index}
        index={index}
        disableInteractiveElementBlocking={!isEdit}
      >
        {provided1 => (
          <div
            ref={provided1.innerRef}
            {...provided1.draggableProps}
            {...provided1.dragHandleProps}
            style={{
              // marginRight: 10,
              paddingLeft: 0,
              cursor: 'move',
              background: 'white',
              ...provided1.draggableProps.style,
            }}
            role="none"
          >
            <div className="c7n-userMap-epicCard">
              <div
                className="c7n-progress"
                style={{
                  background: epic.color,
                }}
              />
              <div
                className="c7n-bar"
                style={{
                  background: epic.color,
                  width: `${progress * 100}%`,
                }}
              />
              <div
                className="c7n-content"
              >
                <TextArea
                  className="c7n-textArea"
                  autosize={{ minRows: 1, maxRows: 2 }}
                  value={epicName}
                  onChange={this.handleEpicNameChange.bind(this)}
                  onPressEnter={this.handlePressEnter}
                  onDoubleClick={this.handleClickTextArea}
                  role="none"
                  onBlur={this.updateEpicName}
                  spellCheck="false"
                />
              </div>

              {/* <div className="c7n-footer">
                <TypeTag
                  typeCode={typeCode}
                />
                <span className="c7n-issueCard-storyPoints">
                  {storyPoints}
                </span>
                <StatusTag
                  name={statusName}
                  color={statusColor}
                />
              </div> */}

              <div className="c7n-footer">
                <div className="c7n-footer-left">
                  <TypeTag
                    typeCode="issue_epic"
                  />
                  <span className="c7n-issueCount">{epic.totalEstimate}</span>
                  <StatusTag name={epic.statusName} color={epic.statusColor} />
                </div>
                <span
                  className="c7n-issueNum"
                  role="none"
                  onClick={() => {
                    const { history } = this.props;
                    const urlParams = AppState.currentMenuType;
                    history.push(`/agile/issue?type=${urlParams.type}&id=${urlParams.id}&name=${encodeURIComponent(urlParams.name)}&organizationId=${urlParams.organizationId}&paramName=${epic.issueNum}&paramIssueId=${epic.issueId}&paramUrl=usermap`);
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
