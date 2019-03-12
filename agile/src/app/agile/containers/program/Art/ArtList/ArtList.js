import React, { Component } from 'react';
import { Page, Header, Content } from 'choerodon-front-boot';
import { Button, Icon, Table } from 'choerodon-ui';
import PropTypes from 'prop-types';
import { editArtLink } from '../../../../common/utils';
import { ArtTable, CreateArt } from './components';

class ArtList extends Component {
  state={
    data: [{
      id: 1,
      num: '#PRO-1',
      status: '进行中',
      name: '项目A敏捷发布火车',
      startDate: '2019-02-24',
      createDate: '2019-02-24',
    }],
    createArtVisible: false,
    createArtLoading: false,
  }

  handleCreateArtClick=() => {
    this.setState({
      createArtVisible: true,
    });
  }

  handleCreateArt=() => {
    
  }

  handleArtCreateCancel=() => {
    this.setState({
      createArtVisible: false,
    });
  }

  handleEditArtClick=(record) => {
    const { id: artId } = record;    
    const { history } = this.props;
    history.push(editArtLink(artId));
  }

  render() {
    const { data, createArtVisible, createArtLoading } = this.state;
    return (
      <Page className="c7ntest-Issue c7ntest-region">
        <Header
          title="ART列表"
        >          
          <Button icon="playlist_add" onClick={this.handleCreateArtClick}>
           创建ART
          </Button>
          {/* <Button icon="autorenew">           
            刷新
          </Button> */}
        </Header>
        <Content>          
          <CreateArt 
            visible={createArtVisible} 
            loading={createArtLoading}
            onCancel={this.handleArtCreateCancel}
            onSubmit={this.handleCreateArt}
          />
          <ArtTable 
            dataSource={data}
            onEditArtClick={this.handleEditArtClick}
          />
        </Content>
      </Page>
    );
  }
}

ArtList.propTypes = {

};

export default ArtList;
