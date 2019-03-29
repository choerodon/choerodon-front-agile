import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import SprintName from './SprintHeaderComponent/SprintName';
import SprintVisibleIssue from './SprintHeaderComponent/SprintVisibleIssue';
import PILastDays from './SprintHeaderComponent/PILastDays';
import SprintStatus from './SprintHeaderComponent/SprintStatus';
import PIDateRange from './SprintHeaderComponent/PIDateRange';
import '../PI.scss';

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
      const { data, AppState, store } = this.props;
      const { objectVersionNumber } = this.state;
      const req = {
        objectVersionNumber,
        projectId: AppState.currentMenuType.id,
        sprintId: data.sprintId,
        piName: value,
      };
      store.axiosUpdateSprint(req).then((res) => {
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
      data, expand, toggleSprint, piId, issueCount, refresh, store,
    } = this.props;
    const {
      piName, startDate, endDate,
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
              <PILastDays
                startDate={startDate}
                endDate={endDate}
              />
            </div>
          </div>
          <div style={{ flex: 9 }}>
            <SprintStatus
              piId={piId}
              refresh={refresh}
              store={store}
              data={data}
              statusCode={data.statusCode}
              type="pi"
            />
          </div>
        </div>
        <div
          className="c7n-backlog-sprintGoal"
          style={{
            display: 'flex',
          }}
        >
          <PIDateRange
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      </div>
    );
  }
}

export default SprintHeader;
