import React, { Component } from 'react';
import { stores, axios } from 'choerodon-front-boot';
import { Progress, Spin } from 'choerodon-ui';
import './SprintProgressHome.scss';

const { AppState } = stores;

class SprintProgressHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sprint: {},
      loading: true,
    };
  }

  componentDidMount() {
    this.loadData();
  }
  
  getTotalDay(startDate, endDate) {
    if (startDate !== undefined && startDate !== null && endDate !== undefined && endDate !== null) {
      startDate = startDate.substr(0, 10);
      endDate = endDate.substr(0, 10);
      const aStartDate = startDate.split('-');
      const aEndDate = endDate.split('-');
      startDate = new Date(`${aStartDate[1]}-${aStartDate[2]}-${aStartDate[0]}`);
      endDate = new Date(`${aEndDate[1]}-${aEndDate[2]}-${aEndDate[0]}`);
      return (parseInt(Math.abs(startDate - endDate) / 1000 / 60 / 60 / 24) + 1);
    }
  }

  loadData() {
    const projectId = AppState.currentMenuType.id;
    axios.get(`agile/v1/projects/${projectId}/sprint/active`)
      .then((res) => {
        this.setState({
          sprint: res,
          loading: false,
        });
      });  
  }

  render() {
    const { sprint, loading } = this.state;
    const totalDay = this.getTotalDay(sprint.startDate, sprint.end);
    return (
      <div className="c7n-SprintProgressHome">
        {
        loading ? (
          <div className="c7n-loadWrap">
            <Spin />
          </div>
        ) : (
          <React.Fragment>
            <p className="c7n-SprintStage">
              {`${(sprint.startDate != undefined && sprint.startDate !== null) && sprint.startDate.substr(5, 2).replace(/\b(0+)/gi, '')}/${(sprint.startDate != undefined && sprint.startDate != null) && sprint.startDate.substr(8, 2)}-${(sprint.endDate != undefined && sprint.endDate != undefined) && sprint.endDate.substr(5, 2).replace(/\b(0+)/gi, '')}/${(sprint.endDate != undefined && sprint.endDate != null) && sprint.endDate.substr(8, 2)} ${sprint.sprintName}`}
            </p>
            <p className="c7n-SprintRemainDay">
              {'剩余'}
              <span className="c7n-remainDay">{sprint.dayRemain > 0 ? sprint.dayRemain : 0}</span>
              {'天'}
            </p>
            <div className="c7n-progress">
              <Progress percent={(sprint.dayRemain > 0 ? totalDay - sprint.dayRemain : totalDay) / totalDay * 100} showInfo={false} />
              <span className="c7n-sprintStart">{`${(sprint.startDate !== undefined && sprint.startDate !== null) && sprint.startDate.substr(5, 2).replace(/\b(0+)/gi, '')}/${sprint.startDate !== undefined && sprint.startDate !== null && sprint.startDate.substr(8, 2)}`}</span>
              <span className="c7n-sprintEnd">{`${(sprint.endDate !== undefined && sprint.endDate !== null) && sprint.endDate.substr(5, 2).replace(/\b(0+)/gi, '')}/${(sprint.endDate !== undefined && sprint.endDate !== null) && sprint.endDate.substr(8, 2)}`}</span>
            </div>
          </React.Fragment>
        )
      }
        
      </div>
    );
  }
}
export default SprintProgressHome;
