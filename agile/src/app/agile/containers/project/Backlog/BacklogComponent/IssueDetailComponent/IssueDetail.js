import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import EditIssue from '../../../../../components/EditIssueNarrow';
import './IssueDetail.scss';
import BacklogStore from '../../../../../stores/project/backlog/BacklogStore';

@inject('AppState')
@observer
class IssueDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  handleIssueUpdate() {
    const chosenEpic = BacklogStore.getChosenEpic;
    BacklogStore.axiosGetSprint(BacklogStore.getSprintFilter()).then((res) => {
      BacklogStore.setSprintData(res);
    }).catch((error) => {
      window.console.error(error);
    });
  }
  refreshIssueDetail() {
    if (this.editIssue) {
      this.editIssue.refresh();
    }
  }
  render() {
    return (
      <div
        className={this.props.visible ? 'c7n-issueDetail-container' : ''}
      >
        {this.props.visible ? (
          <EditIssue
            onRef={(ref) => {
              this.editIssue = ref;
            }}
            issueId={BacklogStore.getClickIssueDetail.issueId}
            onCancel={() => {
              BacklogStore.setClickIssueDetail({});
              BacklogStore.setIsLeaveSprint(false);
              this.props.cancelCallback();
            }}
            onDeleteIssue={() => {
              BacklogStore.setClickIssueDetail({});
              BacklogStore.setIsLeaveSprint(false);
              this.props.refresh();
            }}
            onUpdate={this.handleIssueUpdate.bind(this)}
          />
        ) : ''}
      </div>
    );
  }
}

export default IssueDetail;

