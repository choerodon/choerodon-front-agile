import React, { Component } from 'react';
import { axios, stores } from 'choerodon-front-boot';
import './Remain.scss';
import { Spin } from 'choerodon-ui';
import Progress from '../../../../../../components/Progress';

const { AppState } = stores;
class Remain extends Component {
  constructor(props) {
    super(props);
    this.state = {
      completeInfo: {},
      loading: true,
    };
  }

  componentDidMount() {
    this.loadDate();
  }

  loadDate() {
    const projectId = AppState.currentMenuType.id;
    axios.get(`agile/v1/projects/${projectId}/issues/count`)
      .then((res) => {
        this.setState({
          completeInfo: res,
          loading: false,
        });
      });  
  }

  render() {
    const { completeInfo, loading } = this.state;
    return (
      <div className="c7n-sprintDashboard-remainDay">
        {
         loading ? (
           <div className="c7n-loadWrap">
             <Spin />
           </div>
         ) : (
           <div className="wrap">
              <span className="word">剩余</span>
              <div className="progress">
                <Progress
                  percent={completeInfo.unresolved / completeInfo.all * 100}
                  title={completeInfo.unresolved}
                />
              </div>
              <span className="word">天</span>
           </div>
         )
       }
      </div>
    );
  }
}
export default Remain;
