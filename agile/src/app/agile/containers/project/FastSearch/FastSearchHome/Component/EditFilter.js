import React, { Component } from 'react';
import { Modal, Form, Input, Select, message, Icon, Button, DatePicker } from 'choerodon-ui';
import { Content, stores, axios } from 'choerodon-front-boot';
import moment from 'moment';
import _ from 'lodash';
import { NumericInput } from '../../../../../components/CommonComponent';
import './Filter.scss';

const { Sidebar } = Modal;
const { TextArea } = Input;
const { Option } = Select;
const { AppState } = stores;
const FormItem = Form.Item;

let sign = -1;

class AddComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      origin: {},
      arr: [],
      o: [],
      originUsers: [],
      originStatus: [],
      originPriorities: [],
      originEpics: [],
      originSprints: [],
      originLabels: [],
      originComponents: [],
      originVersions: [],
      originTypes: [],
      loading: false,
      filters: [
        {
          prop: undefined,
          rule: undefined,
          value: undefined,
        },
      ],
      quickFilterFiled: [],
      delete: [],
    };
  }

  componentDidMount() {
    this.loadQuickFilterFiled();
    this.loadFilter(this.props.filterId);
    this.loadQuickFilter();
  }

  loadFilter(filterId = this.props.filterId) {
    axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/quick_filter/${filterId}`)
      .then((res) => {
        const description = res.description.split('+++')[0] || '';
        const obj = JSON.parse(res.description.split('+++')[1]);
        this.setState({
          arr: this.transformInit(obj.arr || []),
          o: obj.o || [],
          origin: {
            ...res,
            description,
          },
        });
      });
  }

  loadQuickFilterFiled() {
    axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/quick_filter/fields`)
      .then((res) => {
        this.setState({
          quickFilterFiled: res,
        });
      });
  }

  loadQuickFilter() {
    const projectId = AppState.currentMenuType.id;
    const OPTION_FILTER = {
      assignee: {
        url: `/iam/v1/projects/${AppState.currentMenuType.id}/users`,
        prop: 'content',
        id: 'id',
        name: 'realName',
      },
      priority: {
        url: `/agile/v1/projects/${AppState.currentMenuType.id}/lookup_values/priority`,
        prop: 'lookupValues',
        id: 'valueCode',
        name: 'name',
      },
      status: {
        url: `/agile/v1/projects/${AppState.currentMenuType.id}/issue_status/list`,
        prop: '',
        id: 'id',
        name: 'name',
      },
      epic: {
        url: `/agile/v1/projects/${projectId}/issues/epics/select_data`,
        prop: '',
        id: 'issueId',
        name: 'epicName',
      },
      sprint: {
        // post
        url: `/agile/v1/projects/${projectId}/sprint/names`,
        method: 'post',
        prop: '',
        id: 'sprintId',
        name: 'sprintName',
      },
      label: {
        url: `/agile/v1/projects/${projectId}/issue_labels`,
        prop: '',
        id: 'labelId',
        name: 'labelName',
      },
      component: {
        url: `/agile/v1/projects/${projectId}/component`,
        prop: '',
        id: 'componentId',
        name: 'name',
      },
      version: {
        // post
        url: `/agile/v1/projects/${projectId}/product_version/names`,
        method: 'post',
        prop: '',
        id: 'versionId',
        name: 'name',
      },
    };
    axios.get(`/iam/v1/projects/${AppState.currentMenuType.id}/users`).then(res => this.setState({ originUsers: res.content }));
    axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/lookup_values/priority`).then(res => this.setState({ originPriorities: res.lookupValues }));
    axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/issue_status/list`).then(res => this.setState({ originStatus: res }));
    axios.get(`/agile/v1/projects/${projectId}/issues/epics/select_data`).then(res => this.setState({ originEpics: res }));
    axios.post(`/agile/v1/projects/${projectId}/sprint/names`).then(res => this.setState({ originSprints: res }));
    axios.get(`/agile/v1/projects/${projectId}/issue_labels`).then(res => this.setState({ originLabels: res }));
    axios.get(`/agile/v1/projects/${projectId}/component`).then(res => this.setState({ originComponents: res }));
    axios.post(`/agile/v1/projects/${projectId}/product_version/names`).then(res => this.setState({ originVersions: res }));
    this.setState({
      originTypes: [
        {
          valueCode: 'story',
          name: '故事',
        },
        {
          valueCode: 'task',
          name: '任务',
        },
        {
          valueCode: 'bug',
          name: '故障',
        },
        {
          valueCode: 'issue_epic',
          name: '史诗',
        },
      ],
    });
  }

  getOperation(filter) {
    const OPERATION_FILTER = {
      assignee: ['=', '!=', 'is', 'isNot', 'in', 'notIn'],
      priority: ['=', '!=', 'in', 'notIn'],
      issue_type: ['=', '!=', 'in', 'notIn'],
      status: ['=', '!=', 'in', 'notIn'],
      reporter: ['=', '!=', 'is', 'isNot', 'in', 'notIn'],
      created_user: ['=', '!=', 'is', 'isNot', 'in', 'notIn'],
      last_updated_user: ['=', '!=', 'is', 'isNot', 'in', 'notIn'],
      epic: ['=', '!=', 'is', 'isNot', 'in', 'notIn'],
      sprint: ['=', '!=', 'is', 'isNot', 'in', 'notIn'],
      label: ['=', '!=', 'is', 'isNot', 'in', 'notIn'],
      component: ['=', '!=', 'is', 'isNot', 'in', 'notIn'],
      influence_version: ['=', '!=', 'is', 'isNot', 'in', 'notIn'],
      fix_version: ['=', '!=', 'is', 'isNot', 'in', 'notIn'],
      creation_date: ['>', '>=', '<', '<='],
      last_update_date: ['>', '>=', '<', '<='],
      story_point: ['<', '<=', '=', '>=', '>', 'is', 'isNot'],
      remain_time: ['<', '<=', '=', '>=', '>', 'is', 'isNot'],
    };
    return OPERATION_FILTER[filter] || [];
  }

  transformInit(arr) {
    return arr.map((a, i) => ({
      fieldCode: a.fieldCode,
      operation: a.operation,
      value: this.transformInitialValue(i, a.fieldCode, a.operation, a.value),
    }));
  }

  transformInitialValue(index, filter, operation, value) {
    const projectId = AppState.currentMenuType.id;
    const OPTION_FILTER = {
      assignee: {
        url: `/iam/v1/projects/${AppState.currentMenuType.id}/users`,
        prop: 'content',
        id: 'id',
        name: 'realName',
        state: 'originUsers',
      },
      priority: {
        url: `/agile/v1/projects/${AppState.currentMenuType.id}/lookup_values/priority`,
        prop: 'lookupValues',
        id: 'valueCode',
        name: 'name',
        state: 'originPriorities',
      },
      status: {
        url: `/agile/v1/projects/${AppState.currentMenuType.id}/issue_status/list`,
        prop: '',
        id: 'id',
        name: 'name',
        state: 'originStatus',
      },
      reporter: {
        url: `/iam/v1/projects/${AppState.currentMenuType.id}/users`,
        prop: 'content',
        id: 'id',
        name: 'realName',
        state: 'originUsers',
      },
      created_user: {
        url: `/iam/v1/projects/${AppState.currentMenuType.id}/users`,
        prop: 'content',
        id: 'id',
        name: 'realName',
        state: 'originUsers',
      },
      last_updated_user: {
        url: `/iam/v1/projects/${AppState.currentMenuType.id}/users`,
        prop: 'content',
        id: 'id',
        name: 'realName',
        state: 'originUsers',
      },
      epic: {
        url: `/agile/v1/projects/${projectId}/issues/epics/select_data`,
        prop: '',
        id: 'issueId',
        name: 'epicName',
        state: 'originEpics',
      },
      sprint: {
        // post
        url: `/agile/v1/projects/${projectId}/sprint/names`,
        prop: '',
        id: 'sprintId',
        name: 'sprintName',
        state: 'originSprints',
      },
      label: {
        url: `/agile/v1/projects/${projectId}/issue_labels`,
        prop: '',
        id: 'labelId',
        name: 'labelName',
        state: 'originLabels',
      },
      component: {
        url: `/agile/v1/projects/${projectId}/component`,
        prop: '',
        id: 'componentId',
        name: 'name',
        state: 'originComponents',
      },
      influence_version: {
        // post
        url: `/agile/v1/projects/${projectId}/product_version/names`,
        prop: '',
        id: 'versionId',
        name: 'name',
        state: 'originVersions',
      },
      fix_version: {
        // post
        url: `/agile/v1/projects/${projectId}/product_version/names`,
        prop: '',
        id: 'versionId',
        name: 'name',
        state: 'originVersions',
      },
      issue_type: {
        url: '',
        prop: '',
        id: 'valueCode',
        name: 'name',
        state: 'originTypes',
      },
    };
    if (sign === index) {
      if (operation === 'in' || operation === 'notIn') {
        sign = -1;
        return [];
      } else {
        sign = -1;
        return undefined;
      }
    }
    if (filter === 'creation_date' || filter === 'last_update_date') {
      // return moment
      return moment(value, 'YYYY-MM-DD HH:mm:ss');
    } 
    if (operation === 'is' || operation === 'isNot' || operation === 'is not') {
      return ({
        key: "'null'",
        label: '空',
      });
    }
    if (filter === 'story_point' || filter === 'remain_time') {
      return value;
    }
    if (filter === 'priority' || filter === 'issue_type') {
      if (operation === 'in' || operation === 'notIn' || operation === 'not in') {
        const arr = value.slice(1, -1).split(',');
        return arr.map(v => ({
          key: v.slice(1, -1),
          label: _.find(this.state[OPTION_FILTER[filter].state], { valueCode: v.slice(1, -1) }).name,
        }));
      } else {
        const k = value.slice(1, -1);
        return ({
          key: k,
          label: _.find(this.state[OPTION_FILTER[filter].state], { valueCode: k }).name,
        });
      }
    } else {
      if (operation === 'in' || operation === 'notIn' || operation === 'not in') {
        const arr = value.slice(1, -1).split(',');
        return arr.map(v => ({
          key: v * 1,
          label: _.find(this.state[OPTION_FILTER[filter].state], { [OPTION_FILTER[filter].id]: v * 1 }) ? _.find(this.state[OPTION_FILTER[filter].state], { [OPTION_FILTER[filter].id]: v * 1 })[OPTION_FILTER[filter].name] : undefined,
        }));
      } else {
        const k = value * 1;
        return ({
          key: k,
          label: _.find(this.state[OPTION_FILTER[filter].state], { [OPTION_FILTER[filter].id]: k }) ? _.find(this.state[OPTION_FILTER[filter].state], { [OPTION_FILTER[filter].id]: k })[OPTION_FILTER[filter].name] : undefined,
        });
      }
    }
  }

  transformOperation(value) {
    const OPERATION = {
      '=': '=',
      '!=': '!=',
      in: 'in',
      'not in': 'notIn',
      is: 'is',
      'is not': 'isNot',
      '<': '<',
      '<=': '<=',
      '>': '>',
      '>=': '>=',
    };
    return OPERATION[value];
  }

  transformOperation2(value) {
    const OPERATION = {
      '=': '=',
      '!=': '!=',
      in: 'in',
      notIn: 'not in',
      is: 'is',
      isNot: 'is not',
      '<': '<',
      '<=': '<=',
      '>': '>',
      '>=': '>=',
    };
    return OPERATION[value];
  }

  handleOk(e) {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const arr = [];
        const expressQueryArr = [];
        const o = [];
        const f = this.state.arr.slice();
        f.forEach((v, i) => {
          if (this.state.delete.indexOf(i) !== -1) {
            return;
          }
          const a = {
            fieldCode: values[`filter-${i}-prop`],
            operation: this.transformOperation2(values[`filter-${i}-rule`]),
            value: this.getValue(values[`filter-${i}-value`], values[`filter-${i}-prop`]),
          };
          if (i) {
            o.push(values[`filter-${i}-ao`]);
            expressQueryArr.push(values[`filter-${i}-ao`].toUpperCase());
          }
          arr.push(a);
          expressQueryArr.push(_.find(this.state.quickFilterFiled, { fieldCode: a.fieldCode }).name);
          expressQueryArr.push(a.operation);
          expressQueryArr.push(this.getLabel(values[`filter-${i}-value`]));
        });
        const d = new Date();
        const json = JSON.stringify({
          arr,
          o,
        });
        const obj = {
          childIncluded: true,
          objectVersionNumber: this.state.origin.objectVersionNumber,
          expressQuery: expressQueryArr.join(' '),
          name: values.name,
          description: `${values.description || ''}+++${json}`,
          projectId: AppState.currentMenuType.id,
          quickFilterValueDTOList: arr,
          relationOperations: o,
        };
        this.setState({
          loading: true,
        });
        axios.put(`/agile/v1/projects/${AppState.currentMenuType.id}/quick_filter/${this.props.filterId}`, obj)
          .then((res) => {
            this.setState({
              loading: false,
            });
            this.props.onOk();
          });
      }
    });
  }

  getValue(value, filter) {
    const type = Object.prototype.toString.call(value);
    if (filter === 'priority' || filter === 'issue_type') {
      if (type === '[object Array]') {
        const v = _.map(value, 'key');
        const vv = v.map(e => `'${e}'`);
        return `(${vv.join(',')})`;
      } else {
        const v = value.key;
        return `'${v}'`;
      }
    } else if (type === '[object Array]') {
        const v = _.map(value, 'key');
        return `(${  v.join(',')  })`;
      } else if (type === '[object Object]') {
        if (value.key) {
          const v = value.key;
          if (Object.prototype.toString.call(v) === '[object Number]') {
            return v;
          } else if (Object.prototype.toString.call(v) === '[object String]') {
            return v;
          }
        } else {
          return value.format('YYYY-MM-DD HH:mm:ss');
        }
      } else {
        return value;
      }
  }

  getLabel(value) {
    if (Object.prototype.toString.call(value) === '[object Array]') {
      const v = _.map(value, 'label');
      return `[${v.join(',')}]`;
    } else if (Object.prototype.toString.call(value) === '[object Object]') {
      if (value.key) {
        const v = value.label;
        if (Object.prototype.toString.call(v) === '[object Number]') {
          return v;
        } else if (Object.prototype.toString.call(v) === '[object String]') {
          return v;
        }
      } else {
        return value.format('YYYY-MM-DD HH:mm:ss');
      }
    } else {
      return value;
    }
  }

  tempOption = (filter, addEmpty) => {
    const projectId = AppState.currentMenuType.id;
    const OPTION_FILTER = {
      assignee: {
        url: `/iam/v1/projects/${AppState.currentMenuType.id}/users`,
        prop: 'content',
        id: 'id',
        name: 'realName',
        state: 'originUsers',
      },
      priority: {
        url: `/agile/v1/projects/${AppState.currentMenuType.id}/lookup_values/priority`,
        prop: 'lookupValues',
        id: 'valueCode',
        name: 'name',
        state: 'originPriorities',
      },
      status: {
        url: `/agile/v1/projects/${AppState.currentMenuType.id}/issue_status/list`,
        prop: '',
        id: 'id',
        name: 'name',
        state: 'originStatus',
      },
      reporter: {
        url: `/iam/v1/projects/${AppState.currentMenuType.id}/users`,
        prop: 'content',
        id: 'id',
        name: 'realName',
        state: 'originUsers',
      },
      created_user: {
        url: `/iam/v1/projects/${AppState.currentMenuType.id}/users`,
        prop: 'content',
        id: 'id',
        name: 'realName',
        state: 'originUsers',
      },
      last_updated_user: {
        url: `/iam/v1/projects/${AppState.currentMenuType.id}/users`,
        prop: 'content',
        id: 'id',
        name: 'realName',
        state: 'originUsers',
      },
      epic: {
        url: `/agile/v1/projects/${projectId}/issues/epics/select_data`,
        prop: '',
        id: 'issueId',
        name: 'epicName',
        state: 'originEpics',
      },
      sprint: {
        // post
        url: `/agile/v1/projects/${projectId}/sprint/names`,
        prop: '',
        id: 'sprintId',
        name: 'sprintName',
        state: 'originSprints',
      },
      label: {
        url: `/agile/v1/projects/${projectId}/issue_labels`,
        prop: '',
        id: 'labelId',
        name: 'labelName',
        state: 'originLabels',
      },
      component: {
        url: `/agile/v1/projects/${projectId}/component`,
        prop: '',
        id: 'componentId',
        name: 'name',
        state: 'originComponents',
      },
      influence_version: {
        // post
        url: `/agile/v1/projects/${projectId}/product_version/names`,
        prop: '',
        id: 'versionId',
        name: 'name',
        state: 'originVersions',
      },
      fix_version: {
        // post
        url: `/agile/v1/projects/${projectId}/product_version/names`,
        prop: '',
        id: 'versionId',
        name: 'name',
        state: 'originVersions',
      },
      issue_type: {
        url: '',
        prop: '',
        id: 'valueCode',
        name: 'name',
        state: 'originTypes',
      },
    };
    const arr = this.state[[OPTION_FILTER[filter].state]].map(v => (
      <Option key={v[OPTION_FILTER[filter].id]} value={v[OPTION_FILTER[filter].id]}>
        {v[OPTION_FILTER[filter].name]}
      </Option>
    ));
    if (addEmpty) {
      arr.unshift(<Option key="null" value="null">
        无
      </Option>);
    }
    return arr;
  }

  renderOperation(filter, index) {
    if (!filter) {
      return (
        <Select label="关系" />
      );
    } else {
      return (
        <Select
          label="关系"
          onChange={(v) => {
            sign = index;
            const str = `filter-${index}-value`;
            let value;
            if (v === 'in' || v === 'notIn' || v === 'not in') {
              value = [];
            } else {
              value = undefined;
            }
            this.props.form.setFieldsValue({
              [str]: value,
            });
          }}
        >
          {
            this.getOperation(filter).map(v => (
              <Option key={v} value={v}>{v}</Option>
            ))
          }
        </Select>
      );
    }
  }

  renderValue(filter, opera) {
    let operation;
    if (opera === 'not in') {
      operation = 'notIn';
    } else if (opera === 'is not') {
      operation = 'isNot';
    } else {
      operation = opera;
    }
    if (!filter || !operation) {
      return (
        <Select label="值" />
      );
    } else if (['assignee', 'priority', 'status', 'reporter', 'created_user', 'last_update_user', 'epic', 'sprint', 'label', 'component', 'influence_version', 'fix_version', 'issue_type'].indexOf(filter) > -1) {
      // select
      if (['=', '!='].indexOf(operation) > -1) {
        // return normal value
        return (
          <Select
            label="值"
            labelInValue
          >
            {this.tempOption(filter, false)}
          </Select>
        );
      } else if (['is', 'isNot'].indexOf(operation) > -1) {
        // return value add empty
        return (
          <Select
            label="值"
            labelInValue
          >
            <Option key="'null'" value="'null'">
              空
            </Option>
          </Select>
        );
      } else {
        // return multiple value
        return (
          <Select
            label="值"
            labelInValue
            mode="multiple"
          >
            {this.tempOption(filter, false)}
          </Select>
        );
      }
    } else if (['creation_date', 'last_update_date'].indexOf(filter) > -1) {
      // time
      // return data picker
      return (
        <DatePicker
          label="值"
          format={'YYYY-MM-DD HH:mm:ss'}
          showTime
        />
      );
    } else {
      // story points && remainning time
      // return number input
      if (operation === 'is' || operation ==='isNot') {
        return (
          <Select
            label="值"
            labelInValue
          >
            <Option key="'null'" value="'null'">
              空
            </Option>
          </Select>
        );
      } else {
        return (
          <NumericInput
            label="值"
            style={{ lineHeight: '22px', marginBottom: 0, width: 100 }}
          />
        );
      }
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Sidebar
        className="c7n-filter"
        title="修改快速搜索"
        okText="修改"
        cancelText="取消"
        visible
        confirmLoading={this.state.loading}
        onOk={this.handleOk.bind(this)}
        onCancel={this.props.onCancel}
      >
        <Content
          style={{
            padding: 0,
            width: 700,
          }}
          title={`在项目"${AppState.currentMenuType.name}"中修改快速搜索`}
          description="通过定义快速搜索，可以在待办事项和活跃冲刺的快速搜索工具栏生效，帮助您更好的筛选过滤问题面板。"
          // link="#"
        >
          <Form layout="vertical">
            <FormItem>
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                }],
                initialValue: this.state.origin.name,
              })(
                <Input
                  label="名称"
                  maxLength={30}
                />,
              )}
            </FormItem>
            {
              this.state.arr.map((filter, index) => (
                <div key={index.toString()}>
                  {
                    this.state.delete.indexOf(index) === -1 && (
                      <div>
                        {
                          index !== 0 && (
                            <FormItem style={{ width: 80, display: 'inline-block', marginRight: 10 }}>
                              {getFieldDecorator(`filter-${index}-ao`, {
                                rules: [{
                                  required: true,
                                  message: '关系为必选字段',
                                }],
                                initialValue: this.state.o[index - 1],
                              })(
                                <Select label="关系">
                                  <Option key="and" value="and">AND</Option>
                                  <Option key="or" value="or">OR</Option>  
                                </Select>,
                              )}
                            </FormItem>
                          )
                        }
                        <FormItem style={{ width: 120, display: 'inline-block', marginRight: 10 }}>
                          {getFieldDecorator(`filter-${index}-prop`, {
                            rules: [{
                              required: true,
                              message: '属性为必选字段',
                            }],
                            initialValue: this.state.arr[index].fieldCode,
                          })(
                            <Select
                              label="属性"
                              onChange={() => {
                                this.props.form.setFieldsValue({
                                  [`filter-${index}-rule`]: undefined,
                                  [`filter-${index}-value`]: undefined,
                                });
                              }}
                            >
                              {
                                this.state.quickFilterFiled.map(v => (
                                  <Option key={v.fieldCode} value={v.fieldCode}>{v.name}</Option>
                                ))
                              }
                            </Select>,
                          )}
                        </FormItem>
                        <FormItem style={{ width: 80, display: 'inline-block', marginRight: 10 }}>
                          {getFieldDecorator(`filter-${index}-rule`, {
                            rules: [{
                              required: true,
                              message: '关系为必选字段',
                            }],
                            initialValue: this.transformOperation(this.state.arr[index].operation),
                          })(
                            this.renderOperation(this.props.form.getFieldValue(`filter-${index}-prop`), index),
                          )}
                        </FormItem>
                        <FormItem style={{ width: 300, display: 'inline-block' }}>
                          {getFieldDecorator(`filter-${index}-value`, {
                            rules: [{
                              required: true,
                            }],
                            initialValue: this.state.arr[index].value,
                            // initialValue: this.transformInitialValue(index, this.props.form.getFieldValue(`filter-${index}-prop`), this.props.form.getFieldValue(`filter-${index}-rule`)),
                          })(
                            this.renderValue(this.props.form.getFieldValue(`filter-${index}-prop`), this.props.form.getFieldValue(`filter-${index}-rule`)),
                          )}
                        </FormItem>
                        {
                          index ? (
                            <Button
                              shape="circle"
                              style={{ margin: 10 }}
                              onClick={() => {
                                const arr = this.state.delete.slice();
                                arr.push(index);
                                this.setState({
                                  delete: arr,
                                });
                              }}
                            >
                              <Icon type="delete" />
                            </Button>
                          ) : null
                        }
                      </div>
                    )
                  }
                </div>
              ))
            }
            <Button
              type="primary"
              funcTyp="flat"
              onClick={() => {
                const arr = this.state.arr.slice();
                arr.push({
                  prop: undefined,
                  rule: undefined,
                  value: undefined,
                });
                this.setState({
                  arr,
                });
              }}
            >
              <Icon type="add icon" />
              <span>添加属性</span>
            </Button>
            <FormItem>
              {getFieldDecorator('description', {
                initialValue: this.state.origin.description,
              })(
                <TextArea label="描述" autosize maxLength={30} />,
              )}
            </FormItem>
          </Form>
          
        </Content>
      </Sidebar>
    );
  }
}

export default Form.create()(AddComponent);
