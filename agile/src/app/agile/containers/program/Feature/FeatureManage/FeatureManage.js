import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Page, Header, Content } from 'choerodon-front-boot';
import { Button, Icon } from 'choerodon-ui';
import FeatureTable from '../FeatureComponent/FeatureTable';
import CreateFeature from '../FeatureComponent/CreateFeature';

class FeatureManage extends Component {
  state = {
    createFeatureVisible: false,
  }

  handleCreateFeatureClick=() => {
    this.setState({
      createFeatureVisible: true,
    });
  }

  handleCreateFeatureCancel=() => {
    this.setState({
      createFeatureVisible: false,
    });
  }

  handleCreateFeature=() => {

  }

  handleTableRowClick=(record) => {

  }

  render() {
    const { createFeatureVisible } = this.state;
    return (
      <Page className="c7ntest-Issue c7ntest-region">
        <Header title="特性列表">
          <Button icon="playlist_add" onClick={this.handleCreateFeatureClick}>
            创建特性
          </Button>
          <Button icon="refresh">
            刷新
          </Button>
        </Header>
        <Content style={{ display: 'flex', padding: '0' }}>
          <div
            className="c7ntest-content-issue"
            style={{
              flex: 1,
              display: 'block',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            <FeatureTable
              onRow={record => ({
                onClick: (event) => { this.handleTableRowClick(record); },
              })}
            />
          </div>
          <CreateFeature
            visible={createFeatureVisible}
            onCancel={this.handleCreateFeatureCancel}
            onOk={this.handleCreateFeature}
          />
        </Content>
      </Page>
    );
  }
}

FeatureManage.propTypes = {

};

export default FeatureManage;
