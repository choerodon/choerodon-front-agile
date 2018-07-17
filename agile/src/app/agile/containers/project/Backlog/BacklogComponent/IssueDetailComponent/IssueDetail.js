import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import _ from 'lodash';
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
    window.console.log('here');
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
              window.console.log('here');
              BacklogStore.setClickIssueDetail({});
              BacklogStore.setIsLeaveSprint(false);
              this.props.cancelCallback();
            }}
            onDeleteIssue={() => {
              window.console.log('here');
              BacklogStore.setClickIssueDetail({});
              BacklogStore.setIsLeaveSprint(false);
              this.props.refresh();
            }}
            onCreateVersion={() => {
              window.console.log('here');
              BacklogStore.axiosGetVersion().then((data2) => {
                const newVersion = [...data2];
                _.forEach(newVersion, (item, index) => {
                  newVersion[index].expand = false;
                });
                BacklogStore.setVersionData(newVersion);
              }).catch((error) => {
                window.console.error(error);
              });
            }}
            onUpdate={this.handleIssueUpdate.bind(this)}
          />
        ) : ''}
      </div>
    );
  }
}

export default IssueDetail;

