import React, { Component } from 'react';
import { DashBoardNavBar } from 'choerodon-front-boot';
import './index.scss';

export default class Guide extends Component {
  render() {
    return (
      <div className="c7n-iam-dashboard-document">
        <ul>
          <li>
            hello，agile
          </li>
        </ul>
        <DashBoardNavBar>
          <a target="choerodon" href="http://choerodon.io/zh/docs/quick-start/">hello，agile</a>
        </DashBoardNavBar>
      </div>
    );
  }
}
