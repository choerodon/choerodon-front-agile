import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Button, Table, Spin, Popover, Tooltip, Icon } from 'choerodon-ui';
import { Page, Header, Content, stores, axios } from 'choerodon-front-boot';
import Filter from './Filter';

const { AppState } = stores;

@observer
class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: [],
      createFileterShow: false,

      component: {},
      currentComponentId: undefined,
      loading: false,
      confirmShow: false,
      editComponentShow: false,
      createComponentShow: false,
    };
  }

  componentDidMount() {
    this.loadFilters();
  }

  showComponent(record) {
    this.setState({
      editComponentShow: true,
      currentComponentId: record.componentId,
    });
  }

  clickDeleteComponent(record) {
    this.setState({
      component: record,
      confirmShow: true,
    });
  }

  deleteComponent() {
    this.setState({
      confirmShow: false,
    });
    this.loadComponents();
  }

  loadFilters() {
    this.setState({
      loading: true,
    });
    axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/quick_filter`)
      .then((res) => {
        this.setState({
          filters: res,
          loading: false,
        });
      })
      .catch((error) => {
        window.console.warn('load components failed, check your organization and project are correct, or please try again later');
      });
  }

  render() {
    const column = [
      {
        title: '名称',
        dataIndex: 'name',
        width: '20%',
        render: name => (
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <Tooltip placement="topLeft" mouseEnterDelay={0.5} title={name}>
              <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0 }}>
                {name}
              </p>
            </Tooltip>
          </div>
        ),
      },
      {
        title: '筛选器',
        dataIndex: 'expressQuery',
        width: '50%',
        render: expressQuery => (
          <div style={{ width: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
            <span style={{ display: 'inline-block', width: 25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
              {expressQuery}
            </span>
          </div>
        ),
      },
      {
        title: '描述',
        dataIndex: 'des',
        width: '25%',
        render: des => (
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <Tooltip placement="topLeft" mouseEnterDelay={0.5} title={des}>
              <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0 }}>
                {des}
              </p>
            </Tooltip>
          </div>
        ),
      },
      {
        title: '',
        dataIndex: 'filterId',
        width: '15%',
        render: (filterId, record) => (
          <div>
            <Popover placement="bottom" mouseEnterDelay={0.5} content={<div><span>详情</span></div>}>
              <Button shape="circle" onClick={this.showComponent.bind(this, record)}>
                <Icon type="mode_edit" />
              </Button>
            </Popover>
            <Popover placement="bottom" mouseEnterDelay={0.5} content={<div><span>删除</span></div>}>
              <Button shape="circle" onClick={this.clickDeleteComponent.bind(this, record)}>
                <Icon type="delete_forever" />
              </Button>
            </Popover>
          </div>
        ),
      },
    ];
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '10px 0 17px 0' }}>
          <Button type="primary" funcTyp="flat" onClick={() => this.setState({ createFileterShow: true })}>
            <Icon type="playlist_add icon" />
            <span>创建快速搜索</span>
          </Button>
        </div>
        <Spin spinning={this.state.loading}>
          <Table
            columns={column}
            dataSource={this.state.filters}
            scroll={{ x: true }}
          />
          
        </Spin>
        {
          this.state.createFileterShow ? (
            <Filter
              onOk={() => this.setState({ createFileterShow: false })}
              onCancel={() => this.setState({ createFileterShow: false })}
            />
          ) : null
        }
      </div>
    );
  }
}

export default Search;
