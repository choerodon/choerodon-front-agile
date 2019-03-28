import React, { Component } from 'react';
import {
  Page, Header, Content, stores, 
} from 'choerodon-front-boot';
import { Button, Spin } from 'choerodon-ui';
import moment from 'moment';
import { editArtLink, PICalendarLink } from '../../../../common/utils';
import { ArtTable, CreateArt } from './components';
import {
  getArtsByProjectId, createArt, beforeArtFinish, editArt, getArtById,
} from '../../../../api/ArtApi';

function formatter(values) {
  const data = { ...values };
  Object.keys(data).forEach((key) => {
    if (moment.isMoment(data[key])) {
      data[key] = moment(data[key]).format('YYYY-MM-DD HH:mm:ss');
    }
  });
  return data;
}
const { AppState } = stores;
class ArtList extends Component {
  state = {
    loading: true,
    data: [],
    createDisabled: true,
    createArtVisible: false,
    createArtLoading: false,
  }

  componentDidMount() {
    this.loadArts();
  }

  loadArts = () => {
    this.setState({
      loading: true,
    });
    getArtsByProjectId().then((res) => {
      this.setState({
        loading: false,
        data: res.content,
        createDisabled: res.content && res.content.length > 0,
      });
    });
  }

  handleCreateArtClick = () => {
    this.setState({
      createArtVisible: true,
    });
  }

  handleCreateArt = (data) => {
    const projectId = AppState.currentMenuType.id;
    const Data = { ...formatter(data), programId: projectId };
    // console.log(Data);
    this.setState({
      createArtLoading: true,
    });
    createArt(Data).then((res) => {
      this.setState({
        createArtVisible: false,
        createArtLoading: false,
      });
      this.loadArts();
    }).catch((err) => {
      this.setState({
        createArtVisible: false,
        createArtLoading: false,
      });
    });
  }

  handleArtCreateCancel = () => {
    this.setState({
      createArtVisible: false,
    });
  }

  handleEditArtClick = (record) => {
    const { id: artId } = record;
    const { history } = this.props;
    history.push(editArtLink(artId));
  }

  handleArtNameClick = (record) => {
    const { id: artId, name: ArtName } = record;
    const { history } = this.props;
    history.push(PICalendarLink(artId, ArtName));
  }

  handleFinishArtClick = (record) => {
    const { id: artId } = record;
    this.setState({
      loading: true,
    });
    beforeArtFinish(artId).then((res) => {
      if (res) {
        getArtById(artId).then((artInfo) => {
          editArt(Object.assign(artInfo, { statusCode: 'done' })).then(() => {
            this.loadArts();
          });
        });
      } else {
        this.setState({
          loading: false,
        });
        Choerodon.prompt('请确保所有PI完成后再完成ART');
      }
    });
  }
  
  handlePaginationChange = (pagination) => {
    this.loadArts(pagination);
  }

  render() {
    const {
      data, createArtVisible, createArtLoading, pagination, loading, createDisabled,
    } = this.state;
    return (
      <Page className="c7ntest-Issue c7ntest-region">
        <Header
          title="ART列表"
        >
          {/* <Button icon="playlist_add" onClick={this.handleCreateArtClick} disabled={createDisabled}> */}
          <Button icon="playlist_add" onClick={this.handleCreateArtClick}>
            {'创建ART'}
          </Button>
        </Header>
        <Content>
          <Spin spinning={loading}>
            <CreateArt
              visible={createArtVisible}
              loading={createArtLoading}
              onCancel={this.handleArtCreateCancel}
              onSubmit={this.handleCreateArt}
            />
            <ArtTable         
              dataSource={data}
              onEditArtClick={this.handleEditArtClick}
              onArtNameClick={this.handleArtNameClick}
              onFinishArtClick={this.handleFinishArtClick}
            />
          </Spin>
        </Content>
      </Page>
    );
  }
}


export default ArtList;
