import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Button, Table, Spin, Popover, Tooltip, Icon, Modal } from 'choerodon-ui';
import { Page, Header, Content, stores, axios } from 'choerodon-front-boot';
import Filter from './Filter';
import EditFilter from './EditFilter';

const { AppState } = stores;
const confirm = Modal.confirm;

@observer
class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: [],
      createFileterShow: false,
      currentFilterId: undefined,
      filter: {},
      confirmShow: false,

      loading: false,
      editComponentShow: false,
      createComponentShow: false,
    };
  }

  componentDidMount() {
    this.loadFilters();
  }

  showFilter(record) {
    this.setState({
      editFilterShow: true,
      currentFilterId: record.filterId,
    });
  }

  clickDeleteFilter(record) {
    confirm({
      title: `是否删除快速搜索：${record.name}`,
      content: '删除后将无法使用该快速搜索，如果只是想要改变某些条件可以修改快速搜索。',
      onOk() {
        return axios.delete(`/agile/v1/projects/${AppState.currentMenuType.id}/quick_filter/${record.filterId}`);
      },
      onCancel() {},
      onText: '删除',
      okType: 'danger',
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
    axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/quick_filter`)
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
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <Tooltip placement="topLeft" mouseEnterDelay={0.5} title={expressQuery}>
              <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0 }}>
                {expressQuery}
              </p>
            </Tooltip>
          </div>
        ),
      },
      {
        title: '描述',
        dataIndex: 'description',
        width: '25%',
        render: description => (
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <Tooltip placement="topLeft" mouseEnterDelay={0.5} title={description}>
              <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0 }}>
                {description}
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
              <Button shape="circle" onClick={this.showFilter.bind(this, record)}>
                <Icon type="mode_edit" />
              </Button>
            </Popover>
            <Popover placement="bottom" mouseEnterDelay={0.5} content={<div><span>删除</span></div>}>
              <Button shape="circle" onClick={this.clickDeleteFilter.bind(this, record)}>
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
        {
          this.state.editFilterShow ? (
            <EditFilter
              filterId={this.state.currentFilterId}
              onOk={() => this.setState({ editFilterShow: false })}
              onCancel={() => this.setState({ editFilterShow: false })}
            />
          ) : null
        }
      </div>
    );
  }
}

export default Search;
