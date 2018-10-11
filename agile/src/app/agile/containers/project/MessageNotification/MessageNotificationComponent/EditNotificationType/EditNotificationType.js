import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import {
  Page, Header, Content, stores, axios,
} from 'choerodon-front-boot';
import _ from 'lodash';
import {
  Button, Table, Checkbox, Select,
} from 'choerodon-ui';
import './EditNotificationType.scss';

const { Option } = Select;
const { AppState } = stores;
const { 
  type, id, name, organizationId, 
} = AppState.currentMenuType;
@observer
class EditNotificationType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      checkeds: [false, false, false, false],
      userOptions: [],
      userOptionsLoading: false,
      updateData: [],
      selectedValue: [],
      dataSource: [],
    };
  }

  componentDidMount() {
    const { location: { search } } = this.props;
    const noticeType = _.last(search.split('&')).split('=')[1];
    // axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/notice`)
    axios.all([
      axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/notice`),
      axios.get(`/iam/v1/projects/${AppState.currentMenuType.id}/users`),
    ])
      .then(axios.spread((notice, users) => {
        const noticeTypeData = notice.filter(item => item.event === noticeType);
        const noticeTypeUsers = noticeTypeData.filter(item => item.noticeType === 'users')[0];
        // console.log(...noticeTypeData[3].idWithNameDTOList.filter(item => !users.content.find(o => o.id === item.userId)));
        this.setState({
          loading: false,
          // checkeds: noticeTypeData.map(item => item.enable),
          checkeds: _.map(noticeTypeData, 'enable'),
          userOptions: [...users.content, ...noticeTypeData[3].idWithNameDTOList.filter(item => !users.content.find(o => o.id === item.userId))],
          updateData: _.map(noticeTypeData, (item) => {
            const pickItem = _.pick(item, ['id', 'event', 'noticeType', 'noticeName', 'enable', 'user', 'objectVersionNumber']);
            // console.log(`pickItem: ${JSON.stringify(pickItem)}`);
            return ({ ...pickItem, objectVersionNumber: pickItem.id ? pickItem.objectVersionNumber : null });
          }),
          selectedValue: noticeTypeUsers && noticeTypeUsers.user && noticeTypeData.filter(item => item.noticeType === 'users')[0].user.split(',').map(item => Number(item)),
          dataSource: [
            {
              key: 'currentProcess',
              checked: noticeTypeData[0].enable,
              typeName: '当前处理人',
            },
            {
              key: 'reportor',
              checked: noticeTypeData[1].enable,
              typeName: '报告人',
            },
            {
              key: 'projectManger',
              checked: noticeTypeData[2].enable,
              typeName: '项目所有者',
            },
            {
              key: 'user',
              checked: noticeTypeData[3].enable,
              typeName: '用户 (可多选)',
            },
          ],
        });
      }))
      .catch((error) => {
        this.setState({
          // roleOptionsLoading: false,
          loading: false,
        });
        Choerodon.prompt('获取信息失败');
      });
  }

  getColumns() {
    const {
      userOptions, userOptionsLoading, checkeds, selectedValue, idWithNameDTOList,
    } = this.state;
    console.log(`userOptions: ${JSON.stringify(userOptions)}`);
    const columns = [
      {
        dataIndex: 'checked',
        key: 'checked',
        render: (text, record, index) => (
          <Checkbox 
            style={{ marginTop: 5, marginBottom: 5 }}
            checked={checkeds[index]}
            onChange={e => this.handleCheckboxChange(e, index)}
          />
        ),
        width: '5%',
      },
      {
        title: '通知类型',
        dataIndex: 'typeName',
        key: 'typeName',
        width: '30%',  
      },
      {
        render: (text, record, index) => (index > 2 ? (
          <Select
            style={{ width: 520 }}
            // onFocus={this.getUserOptions}
            value={selectedValue}
            // value={}
            onChange={value => this.handleSelectChange(value, index)}
            onFilterChange={(param) => {
              this.setState({
                userOptionsLoading: true,
              });
              axios.get(`/iam/v1/projects/${AppState.currentMenuType.id}/users?param=${param}`)
                .then((res) => {
                  this.setState({
                    userOptionsLoading: false,
                    userOptions: res.content,
                    // userOptions: [...res.content, ...(userOptions && _.filter(userOptions, item => item.userId))],

                    // [...res.content, ...(userOptions && _.filter(userOptions, item => item.userId))]
                  }, () => {
                    // console.log(this.state.userOptions);
                  });
                })
                .catch((e) => {
                  console.log(e);
                });
            }}
            mode="multiple"
            label="请选择"
            optionFilterProp="children"
            loading={userOptionsLoading}
            filter
            allowClear
            autoFocus
          >
            {
              // userOptions && _.map(userOptions, item => <Option key={item.id} value={item.id}>{`${item.loginName} ${item.realName}`}</Option>)
              userOptions && _.map(userOptions, item => <Option key={item.id ? item.id : item.userId} value={item.id ? item.id : item.userId}>{item.loginName ? `${item.loginName}${item.realName}` : item.name}</Option>)
            }
          </Select>
        ) : ''),
      },
    ];
    return columns;
  }

  getUserOptions = () => {
    const { userOptions } = this.state;
    console.log('filter:');
    console.log(...(userOptions && _.filter(userOptions, item => item.userId)));
    this.setState({
      userOptionsLoading: true,
    });
    axios.get(`/iam/v1/projects/${AppState.currentMenuType.id}/users`)
      .then((res) => {
        this.setState({
          userOptionsLoading: false,
          // userOptions: res.content,
          // userOptions: [...res.content, ...userOptions],
          userOptions: [...res.content, ...(userOptions && _.filter(userOptions, item => item.userId))],
        });
      })
      .catch((error) => {
        this.setState({
          userOptionsLoading: false,
        });
        Choerodon.prompt('获取用户信息失败');
      });
  }

  handleCheckboxChange = (e, index) => {
    const { checkeds, updateData } = this.state;
    this.setState({
      checkeds: _.map(checkeds, (item, i) => (i === index ? e.target.checked : item)),
      updateData: _.map(updateData, (item, i) => (i === index ? { ...item, enable: e.target.checked } : item)),
    });
  }


  handleSelectChange = (value, index) => {
    // console.log(value);
    // const { userOptions, updateData } = this.state;
    // console.log('filter:');
    // console.log(...(userOptions && _.filter(userOptions, item => item.userId)));
    // this.setState({
    //   userOptionsLoading: true,
    // });
    // axios.get(`/iam/v1/projects/${AppState.currentMenuType.id}/users`)
    //   .then((res) => {
    //     this.setState({
    //       userOptionsLoading: false,
    //       // userOptions: res.content,
    //       // userOptions: [...res.content, ...userOptions],
    //       userOptions: [...res.content, ...(userOptions && _.filter(userOptions, item => item.userId))],
    //       selectedValue: value,
    //       updateData: _.map(updateData, (item, i) => (i === index ? { ...item, user: value.length > 0 ? value.join(',') : 'null' } : item)),
    //     });
    //   })
    //   .catch((error) => {
    //     this.setState({
    //       userOptionsLoading: false,
    //     });
    //     Choerodon.prompt('获取用户信息失败');
    //   });

    const { updateData } = this.state;
    this.setState({
      selectedValue: value,
      updateData: _.map(updateData, (item, i) => (i === index ? { ...item, user: value.length > 0 ? value.join(',') : 'null' } : item)),
    });
  }

 handleSaveBtnClick = () => {
   const { history } = this.props;
   const { updateData } = this.state;
   // console.log(`updata: ${JSON.stringify(updateData)}`);
   axios.put(`/agile/v1/projects/${AppState.currentMenuType.id}/notice`, updateData)
     .then((res) => {
       Choerodon.prompt('更新成功');
       history.push(`/agile/messageNotification?type=${type}&id=${id}&name=${encodeURIComponent(name)}&organizationId=${organizationId}`);
     })
     .catch((error) => {
       Choerodon.prompt('更新失败');
     });
 }

 render() {
   const { dataSource, loading } = this.state;
   return (
     <Page>
       <Header
         title="编辑通知类型"
         backPath={`/agile/messageNotification?type=${type}&id=${id}&name=${encodeURIComponent(name)}&organizationId=${organizationId}`}
       />
       <Content 
         className="c7n-editNotificationType"
       >
         <Table
           loading={loading}
           columns={this.getColumns()}
           dataSource={dataSource}
           filterBar={false}
           pagination={false}
           rowKey={record => record.key}
         />
         <div className="saveOrCancel">
           <Button type="primary" funcType="raised" style={{ marginRight: 10 }} onClick={this.handleSaveBtnClick}>保存</Button>
           <Button 
             funcType="raised"
             onClick={() => {
               const { history } = this.props;
               history.push(`/agile/messageNotification?type=${type}&id=${id}&name=${encodeURIComponent(name)}&organizationId=${organizationId}`);
             }}
           >
             {'取消'}
           </Button>
         </div>
       </Content>
     </Page>
   );
 }
}

export default withRouter(EditNotificationType);
