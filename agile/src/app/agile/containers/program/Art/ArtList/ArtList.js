import React, { Component } from 'react';
import { Page, Header, Content } from 'choerodon-front-boot';
import { Button, Icon, Table } from 'choerodon-ui';
import PropTypes from 'prop-types';
import { createArtLink } from '../../../../common/utils';

class ArtList extends Component {
  handleCreateArtClick=() => {
    const { history } = this.props;
    history.push(createArtLink());
  }

  render() {
    return (
      <Page className="c7ntest-Issue c7ntest-region">
        <Header
          title="artlist"
        >          
          <Button icon="playlist_add" onClick={this.handleCreateArtClick}>
           创建ART
          </Button>
          <Button icon="autorenew">           
            刷新
          </Button>
        </Header>
        <Content style={{ display: 'flex', padding: '0' }}>          
          list
        </Content>
      </Page>
    );
  }
}

ArtList.propTypes = {

};

export default ArtList;
