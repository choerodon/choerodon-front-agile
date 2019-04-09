import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  Table, Spin, Tooltip, Button, Checkbox, Modal,
} from 'choerodon-ui';
import {
  Page, Header, Content, stores,
} from 'choerodon-front-boot';
import './ObjectSchemeDetail.scss';
import CreateField from '../Components/CreateField';

const { confirm } = Modal;
const { AppState } = stores;

@observer
class ObjectSchemeDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      addVisible: false,
    };
  }

  componentDidMount() {
    this.loadScheme();
  }

  loadScheme = () => {
    const { match } = this.props;
    const { ObjectSchemeStore } = this.props;
    this.setState({
      loading: true,
    });
    ObjectSchemeStore.loadSchemeDetail(match.params.code).then(() => {
      this.setState({
        loading: false,
      });
    });
  };

  getColume = () => [
    {
      title: '字段',
      dataIndex: 'name',
      width: '25%',
    },
    {
      title: '显示级别',
      dataIndex: 'contextName',
      width: '25%',
    },
    {
      title: '字段类型',
      dataIndex: 'fieldTypeName',
      width: '25%',
    },
    {
      title: '必填项',
      dataIndex: 'required',
      width: '15',
      render: (required, record) => (
        <div>
          <Checkbox
            defaultChecked={record.required}
            disabled={record.system}
            onChange={() => this.onRequiredChange(record)}
          />
        </div>
      ),
    },
    {
      title: '',
      dataIndex: 'id',
      width: '10%',
      render: (componentId, record) => (
        <div>
          {record.system
            ? ''
            : (
              <React.Fragment>
                <Tooltip placement="top" title="详情">
                  <Button shape="circle" size="small" onClick={() => this.editField(record)}>
                    <i className="icon icon-mode_edit" />
                  </Button>
                </Tooltip>
                <Tooltip placement="top" title="删除">
                  <Button shape="circle" size="small" onClick={() => this.handleDelete(record)}>
                    <i className="icon icon-delete" />
                  </Button>
                </Tooltip>
              </React.Fragment>
            )
          }
        </div>
      ),
    },
  ];

  onRequiredChange = (item) => {
    const { ObjectSchemeStore } = this.props;
    if (item.system) {
      return;
    }
    const field = {
      required: !item.required,
      objectVersionNumber: item.objectVersionNumber,
    };
    ObjectSchemeStore.updateField(item.id, field);
  };

  editField =(item) => {
    const { history } = this.props;
    const urlParams = AppState.currentMenuType;
    history.push(`/agile/objectScheme/field/${item.id}?type=${urlParams.type}&id=${urlParams.id}&name=${encodeURIComponent(urlParams.name)}&organizationId=${urlParams.organizationId}`);
  };

  handleDelete = (item) => {
    if (item.system) {
      return;
    }
    const that = this;
    confirm({
      title: '删除字段',
      content: (
        <div>
          <p style={{ marginBottom: 10 }}>
            {'确认要删除字段 '}
            {item.name}
            {' ？'}
          </p>
        </div>
      ),
      onOk() {
        that.deleteField(item);
      },
      onCancel() {},
      okText: '删除',
      okType: 'danger',
    });
  };

  deleteField = (item) => {
    const { ObjectSchemeStore } = this.props;
    const orgId = AppState.currentMenuType.organizationId;
    ObjectSchemeStore.deleteField(orgId, item.id).then(() => {
      this.loadScheme();
    });
  };

  onClose = () => {
    this.setState({
      addVisible: false,
    });
  };

  onOk = () => {
    this.loadScheme();
    this.setState({
      addVisible: false,
    });
  };

  render() {
    const {
      loading, addVisible,
    } = this.state;
    const menu = AppState.currentMenuType;
    const {
      type, id, organizationId, name: orgName,
    } = menu;

    const { ObjectSchemeStore, match } = this.props;
    const scheme = ObjectSchemeStore.getSchemeDetail;
    const { name = '', content = [] } = scheme;

    return (
      <Page
        className="c7n-object-scheme"
      >
        <Header
          title="编辑方案"
          backPath={`/agile/objectScheme?type=${type}&id=${id}&name=${encodeURIComponent(orgName)}&organizationId=${organizationId}`}
        />
        <Content
          title={name}
        >
          <Spin spinning={loading}>
            <div style={{ marginBottom: 10 }}>
              <Button
                type="primary"
                icon="add"
                funcType="flat"
                onClick={() => {
                  this.setState({
                    addVisible: true,
                  });
                }}
              >
                {'添加字段'}
              </Button>
            </div>
            <Table
              pagination={false}
              rowKey={record => record.id}
              columns={this.getColume()}
              dataSource={content}
              filterBar={false}
              scroll={{ x: true }}
              onChange={this.handleTableChange}
            />
          </Spin>
          {addVisible
            ? (
              <CreateField
                store={ObjectSchemeStore}
                onClose={this.onClose}
                onOk={this.onOk}
                visible={addVisible}
                schemeCode={match.params.code}
              />
            )
            : null
          }
        </Content>
      </Page>
    );
  }
}

export default ObjectSchemeDetail;
