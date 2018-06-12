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
  handleIssueUpdate() {
    const chosenEpic = BacklogStore.getChosenEpic;
    BacklogStore.axiosGetSprint(BacklogStore.getSprintFilter()).then((res) => {
      BacklogStore.setSprintData(res);
    }).catch((error) => {
      window.console.log(error);
    });
  }
  render() {
    return (
      <div
        className={this.props.visible ? 'c7n-issueDetail-container' : ''}
      >
        {this.props.visible ? (
          <EditIssue
            issueId={BacklogStore.getClickIssueDetail.issueId}
            onCancel={() => {
              BacklogStore.setClickIssueDetail({});
              BacklogStore.setIsLeaveSprint(false);
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

