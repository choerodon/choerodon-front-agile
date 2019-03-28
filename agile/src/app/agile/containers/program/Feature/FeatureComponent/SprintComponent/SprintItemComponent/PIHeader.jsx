import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Modal } from 'choerodon-ui';
import SprintName from './SprintHeaderComponent/SprintName';
import SprintVisibleIssue from './SprintHeaderComponent/SprintVisibleIssue';
import SprintStatus from './SprintHeaderComponent/SprintStatus';
import SprintDateRange from './SprintHeaderComponent/PIDateRange';
import '../PI.scss';
import BacklogStore from '../../../../../../stores/project/backlog/BacklogStore';

@inject('AppState', 'HeaderStore')
@observer class SprintHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      piName: props.data.name,
      startDate: props.data.startDate,
      endDate: props.data.endDate,
      objectVersionNumber: props.data.objectVersionNumber,
    };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      piName: nextProps.data.name,
      startDate: nextProps.data.startDate,
      endDate: nextProps.data.endDate,
      objectVersionNumber: nextProps.data.objectVersionNumber,
    });
  }

  handleBlurName = (value) => {
    if (/[^\s]+/.test(value)) {
      const { data, AppState } = this.props;
      const { objectVersionNumber } = this.state;
      const req = {
        objectVersionNumber,
        projectId: AppState.currentMenuType.id,
        sprintId: data.sprintId,
        piName: value,
      };
      BacklogStore.axiosUpdateSprint(req).then((res) => {
        this.setState({
          piName: value,
          objectVersionNumber: res.objectVersionNumber,
        });
      }).catch((error) => {
      });
    }
  };

  render() {
    const {
      data, expand, toggleSprint, sprintId, issueCount, refresh,
    } = this.props;
    const {
      piName, startDate, endDate, sprintGoal,
    } = this.state;

    return (
      <div className="c7n-backlog-sprintTop">
        <div className="c7n-backlog-springTitle">
          <div className="c7n-backlog-sprintTitleSide" style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <SprintName
                type="sprint"
                expand={expand}
                sprintName={piName}
                toggleSprint={toggleSprint}
                handleBlurName={this.handleBlurName}
              />
              <SprintVisibleIssue
                issueCount={issueCount}
              />
            </div>
          </div>
          <div style={{ flex: 9 }}>
            <SprintStatus
              sprintId={sprintId}
              refresh={refresh}
              store={BacklogStore}
              data={data}
              statusCode={data.statusCode}
              type="pi"
            />
          </div>
        </div>
        <div
          className="c7n-backlog-sprintGoal"
          style={{
            display: data.statusCode === 'started' ? 'flex' : 'none',
          }}
        >
          <SprintDateRange
            statusCode={data.statusCode}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      </div>
    );
  }
}

export default SprintHeader;
