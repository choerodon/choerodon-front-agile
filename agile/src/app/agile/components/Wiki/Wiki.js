import React, { Component } from 'react';
import { stores, axios } from 'choerodon-front-boot';
import {
  Modal,
  Table,
} from 'choerodon-ui';
import './Wiki.scss';

const { AppState } = stores;
const { Sidebar } = Modal;

class DailyLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createLoading: false,
      data: [],
      expendIds: [],
      idAddress: {},
      selectedRows: [],
      selectedRowKeys: ['/bin/view/O-Song/P-Song/ceshi/WebHome/'],
      loading: false,
    };
  }

  componentDidMount() {
    this.loadWiki();
  }

  loadWiki = async (id) => {
    const menu = AppState.currentMenuType;
    const { loginName } = AppState.userInfo;
    const { name, id: proId, organizationId } = menu;
    const { data, idAddress } = this.state;
    this.setState({
      loading: true,
    });
    const postData = {
      organizationId,
      projectName: name,
      username: loginName,
    };
    if (id) {
      postData.menuId = id;
    }
    const dataSource = [];
    const newData = await axios.post(`agile/v1/projects/${proId}/wiki_relation/menus`, postData);
    if (newData) {
      let idIndex = idAddress;
      newData.forEach((item, index) => {
        idIndex = {
          ...idIndex,
          [item.id]: idAddress[id] ? [...idAddress[id], index] : [index],
        };
        dataSource.push({
          id: item.id,
          children: item.children ? [] : false,
          href: item.a_attr ? item.a_attr.href : '',
          name: item.text,
        });
      });
      if (id) {
        let goalData = data;
        if (idIndex[id] && idIndex[id].length) {
          idIndex[id].forEach((i) => {
            goalData = goalData[i];
          });
        }
        goalData.children = dataSource;
        this.setState({
          data,
          idAddress: idIndex,
          loading: false,
        });
      } else {
        this.setState({
          data: dataSource,
          idAddress: idIndex,
          loading: false,
        });
      }
    }
  };

  getColumn = () => [
    {
      title: '文档名称',
      dataIndex: 'name',
      key: 'name',
    },
  ];

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  };

  onExpandedRowsChange = (ids) => {
    console.log(ids);
  };

  onExpand = (expand, data) => {
    const { expendIds } = this.state;
    if (expand && expendIds.indexOf(data.id) === -1) {
      this.setState({
        expendIds: [...expendIds, data.id],
      });
      this.loadWiki(data.id);
    }
  };

  render() {
    const {
      onCancel,
      visible,
    } = this.props;
    const {
      createLoading,
      selectedRowKeys,
      data,
      loading,
    } = this.state;

    const { name } = AppState.currentMenuType;

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    return (
      <Sidebar
        className="c7n-dailyLog"
        title="登记工作日志"
        visible={visible || false}
        onOk={this.handleCreateWiki}
        onCancel={onCancel}
        okText="创建"
        cancelText="取消"
        confirmLoading={createLoading}
      >
        <div>
          <p>{`你当前项目为"${name}"，wiki文档的内容所属为当前项目。`}</p>
          <Table
            dataSource={data}
            columns={this.getColumn()}
            rowSelection={rowSelection}
            onExpandedRowsChange={this.onExpandedRowsChange}
            onExpand={this.onExpand}
            rowKey={record => record.href}
            pagination={false}
            loading={loading}
          />
        </div>
      </Sidebar>
    );
  }
}
export default DailyLog;
