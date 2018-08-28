import React, { Component } from 'react';
import { axios, stores } from 'choerodon-front-boot';
import './UncompleteTaskHome.scss';
import Progress from '../../../components/Progress';

const { AppState } = stores;
class UncompleteTaskHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      completeInfo: {},
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
        });
      });  
  }

  render() {
    const { completeInfo } = this.state;
    return (
      <div className="c7n-unCompleteTaskHome">
        <Progress
          percent={completeInfo.unresolved / completeInfo.all * 100}
          title={completeInfo.unresolved}
        />
      </div>
    );
  }
}
export default UncompleteTaskHome;
