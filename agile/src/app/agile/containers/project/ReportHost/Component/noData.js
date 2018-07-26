import { Content } from 'choerodon-front-boot';
import React, { Component } from 'react';

const renderNoData = () => {
  return (<Content>
    <div className=>
      <div className={this.props.className} />
      <div>
        <span>当前项目无可用版本</span>
        <div>请在 <a href="#">发布版本</a>中创建一个版本 </div>
      </div>
    </div>
  </Content>);
};
