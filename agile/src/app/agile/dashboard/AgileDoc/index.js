import React, { Component } from 'react';
import { DashBoardNavBar } from 'choerodon-front-boot';
import './index.scss';

export default class AgileDoc extends Component {
  render() {
    return (
      <div className="c7n-agileDoc">
        <ul>
          <li>
            <a target="choerodon" href="http://choerodon.io/zh/docs/user-guide/agile/backlog/">待办事项</a>
          </li>
          <li>
            <a target="choerodon" href="http://choerodon.io/zh/docs/user-guide/agile/sprint/">活跃冲刺</a>
          </li>
          <li>
            <a target="choerodon" href="http://choerodon.io/zh/docs/user-guide/agile/issue/">问题管理</a>
          </li>
          <li>
            <a target="choerodon" href="http://choerodon.io/zh/docs/user-guide/agile/release/">发布版本</a>
          </li>
          <li>
            <a target="choerodon" href="http://choerodon.io/zh/docs/user-guide/agile/component/">模块管理</a>
          </li>
          <li>
            <a target="choerodon" href="http://choerodon.io/zh/docs/user-guide/agile/report/">报告</a>
          </li>
          <li>
            <a target="choerodon" href="http://choerodon.io/zh/docs/user-guide/agile/setup/">设置</a>
          </li>
        </ul>
        <DashBoardNavBar>
          <a target="choerodon" href="http://choerodon.io/zh/docs/">转至所有文档</a>
        </DashBoardNavBar>
      </div>

    );
  }
}
