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
  /**
   *detail有更新回调待办事项更新
   *
   * @memberof IssueDetail
   */
  handleIssueUpdate() {
    const chosenEpic = BacklogStore.getChosenEpic;
    BacklogStore.axiosGetSprint(BacklogStore.getSprintFilter()).then((res) => {
      BacklogStore.setSprintData(res);
    }).catch((error) => {
    });
  }

  /**
   * 刷新issue详情的数据
   */
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
            onCreateVersion={() => {
              BacklogStore.axiosGetVersion().then((data2) => {
                const newVersion = [...data2];
                for (let index = 0, len = newVersion.length; index < len; index += 1) {
                  newVersion[index].expand = false;
                }
                BacklogStore.setVersionData(newVersion);
              }).catch((error) => {
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

