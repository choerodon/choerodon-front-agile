import React, { Component } from 'react';
import { Modal, Form, Input, Select, message, Icon, Button, DatePicker } from 'choerodon-ui';
import { Content, stores, axios } from 'choerodon-front-boot';
import _ from 'lodash';
import { NumericInput } from '../../../../../components/CommonComponent';

const { Sidebar } = Modal;
const { TextArea } = Input;
const { Option } = Select;
const { AppState } = stores;
const FormItem = Form.Item;

class AddComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      filters: [
        {
          prop: undefined,
          rule: undefined,
          value: undefined,
        },
      ],
      quickFilterFiled: [],
      origin: [],
      delete: [],
      originUsers: [],
      temp: [],
    };
  }

  componentDidMount() {
    this.loadQuickFilterFiled();
  }

  loadQuickFilterFiled() {
    axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/quick_filter/fields`)
      .then((res) => {
        this.setState({
          quickFilterFiled: res,
        });
      });
  }

  handleOk(e) {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        window.console.log(values);
        const arr = [];
        const expressQueryArr = [];
        const o = [];
        const f = this.state.filters.slice();
        f.forEach((v, i) => {
          if (this.state.delete.indexOf(i) !== -1) {
            return;
          }
          const a = {
            fieldCode: values[`filter-${i}-prop`],
            operation: this.transformOperation(values[`filter-${i}-rule`]),
            value: this.getValue(values[`filter-${i}-value`]),
          };
          if (i) {
            o.push(values[`filter-${i}-ao`]);
            expressQueryArr.push(values[`filter-${i}-ao`].toUpperCase());
          }
          arr.push(a);
          expressQueryArr.push(_.find(this.state.quickFilterFiled, { fieldCode: a.fieldCode }).name);
          expressQueryArr.push(a.operation);
          // expressQueryArr.push(this.transformValue(values[`filter-${i}-value`]));
          expressQueryArr.push(this.getLabel(values[`filter-${i}-value`]));
        });
        const json = JSON.stringify({
          arr,
          o,
        });
        const obj = {
          childIncluded: true,
          expressQuery: expressQueryArr.join(' '),
          name: values.name,
          description: `${values.description}+++${json}`,
          projectId: AppState.currentMenuType.id,
          quickFilterValueDTOList: arr,
          relationOperations: o,
        };
        window.console.log(obj);
        this.setState({
          loading: true,
        });
        axios.post(`/agile/v1/project/${AppState.currentMenuType.id}/quick_filter`, obj)
          .then((res) => {
            this.setState({
              loading: false,
            });
            this.props.onOk();
          });
      }
    });
  }

  transformOperation(value) {
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

  getValue(value) {
    if (Object.prototype.toString.call(value) === '[object Array]') {
      const v = _.map(value, 'key');
      return `(${  v.join(',')  })`;
      // return {
      //   key: _.filter(value, 'key'),
      //   value: _.filter(value, 'label'),
      // };
    } else if (Object.prototype.toString.call(value) === '[object Object]') {
      if (value.key) {
        const v = value.key;
        if (Object.prototype.toString.call(v) === '[object Number]') {
          return v;
        } else if (Object.prototype.toString.call(v) === '[object String]') {
          return `'${v}'`;
        }
        // return {
        //   key: value.key,
        //   value: value.label,
        // };
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
      return `(${  v.join(',')  })`;
      // return {
      //   key: _.filter(value, 'key'),
      //   value: _.filter(value, 'label'),
      // };
    } else if (Object.prototype.toString.call(value) === '[object Object]') {
      if (value.key) {
        const v = value.label;
        if (Object.prototype.toString.call(v) === '[object Number]') {
          return v;
        } else if (Object.prototype.toString.call(v) === '[object String]') {
          return `'${v}'`;
        }
        // return {
        //   key: value.key,
        //   value: value.label,
        // };
      } else {
        return value.format('YYYY-MM-DD HH:mm:ss');
      }
    } else {
      return value;
    }
  }

  splitValue(value) {
    if (Object.prototype.toString.call(value) === '[object Array]') {
      return {
        key: _.filter(value, 'key'),
        value: _.filter(value, 'label'),
      };
    } else if (Object.prototype.toString.call(value) === '[object Object]') {
      if (value.key) {
        return {
          key: value.key,
          value: value.label,
        };
      } else {
        return value;
      }
    } else {
      return '';
    }
  }

  transformValue(value) {
    if (Object.prototype.toString.call(value) === '[object Array]') {
      return `(${  value.join(',')  })`;
    } else if (Object.prototype.toString.call(value) === '[object Number]') {
      return value;
    } else if (Object.prototype.toString.call(value) === '[object String]') {
      return `'${value}'`;
    } else if (Object.prototype.toString.call(value) === '[object Object]') {
      return value.format('YYYY-MM-DD HH:mm:ss');
    } else {
      return '';
    }
  }

  getOperation(filter) {
    const OPERATION_FILTER = {
      assignee: ['=', '!=', 'is', 'isNot', 'in', 'notIn'],
      priority: ['=', '!=', 'in', 'notIn'],
      status: ['=', '!=', 'is', 'isNot', 'in', 'notIn'],
      reporter: ['=', '!=', 'is', 'isNot', 'in', 'notIn'],
      created_user: ['=', '!=', 'is', 'isNot', 'in', 'notIn'],
      last_updated_user: ['=', '!=', 'is', 'isNot', 'in', 'notIn'],
      epic: ['=', '!=', 'is', 'isNot', 'in', 'notIn'],
      sprint: ['=', '!=', 'is', 'isNot', 'in', 'notIn'],
      label: ['=', '!=', 'is', 'isNot', 'in', 'notIn'],
      component: ['=', '!=', 'is', 'isNot', 'in', 'notIn'],
      version: ['=', '!=', 'is', 'isNot', 'in', 'notIn'],
      summary: [],
      creation_date: ['>', '>=', '<', '<='],
      last_update_date: ['>', '>=', '<', '<='],
      story_point: ['<', '<=', '=', '>=', '>'],
      remain_time: ['<', '<=', '=', '>=', '>'],
    };
    return OPERATION_FILTER[filter] || [];
  }

  getOption(filter, addEmpty) {
    const projectId = AppState.currentMenuType.id;
    const OPTION_FILTER = {
      assignee: {
        url: `/iam/v1/projects/${AppState.currentMenuType.id}/users`,
        prop: 'content',
        id: 'id',
        name: 'realName',
      },
      priority: {
        url: `/agile/v1/project/${AppState.currentMenuType.id}/lookup_values/priority`,
        prop: 'lookupValues',
        id: 'valueCode',
        name: 'name',
      },
      status: {
        url: `/agile/v1/project/${AppState.currentMenuType.id}/issue_status/list`,
        prop: '',
        id: 'id',
        name: 'name',
      },
      reporter: {
        url: `/iam/v1/projects/${AppState.currentMenuType.id}/users`,
        prop: 'content',
        id: 'id',
        name: 'realName',
      },
      created_user: {
        url: `/iam/v1/projects/${AppState.currentMenuType.id}/users`,
        prop: 'content',
        id: 'id',
        name: 'realName',
      },
      last_updated_user: {
        url: `/iam/v1/projects/${AppState.currentMenuType.id}/users`,
        prop: 'content',
        id: 'id',
        name: 'realName',
      },
      epic: {
        url: `/agile/v1/project/${projectId}/issues/epics/select_data`,
        prop: '',
        id: 'issueId',
        name: 'epicName',
      },
      sprint: {
        // post
        url: `/agile/v1/project/${projectId}/sprint/names`,
        prop: '',
        id: 'sprintId',
        name: 'sprintName',
      },
      label: {
        url: `/agile/v1/project/${projectId}/issue_labels`,
        prop: '',
        id: 'labelId',
        name: 'labelName',
      },
      component: {
        url: `/agile/v1/project/${projectId}/component`,
        prop: '',
        id: 'componentId',
        name: 'name',
      },
      version: {
        // post
        url: `/agile/v1/project/${projectId}/product_version/names`,
        prop: '',
        id: 'versionId',
        name: 'name',
      },
    };
    axios[filter === 'sprint' || filter === 'version' ? 'post' : 'get'](OPTION_FILTER[filter].url)
      .then((res) => {
        this.setState({
          temp: OPTION_FILTER[filter].prop === '' ? res : res[OPTION_FILTER[filter].prop],
        });
      });
  }

  tempOption = (filter, addEmpty) => {
    const projectId = AppState.currentMenuType.id;
    const OPTION_FILTER = {
      assignee: {
        url: `/iam/v1/projects/${AppState.currentMenuType.id}/users`,
        prop: 'content',
        id: 'id',
        name: 'realName',
      },
      priority: {
        url: `/agile/v1/project/${AppState.currentMenuType.id}/lookup_values/priority`,
        prop: 'lookupValues',
        id: 'valueCode',
        name: 'name',
      },
      status: {
        url: `/agile/v1/project/${AppState.currentMenuType.id}/issue_status/list`,
        prop: '',
        id: 'id',
        name: 'name',
      },
      reporter: {
        url: `/iam/v1/projects/${AppState.currentMenuType.id}/users`,
        prop: 'content',
        id: 'id',
        name: 'realName',
      },
      created_user: {
        url: `/iam/v1/projects/${AppState.currentMenuType.id}/users`,
        prop: 'content',
        id: 'id',
        name: 'realName',
      },
      last_updated_user: {
        url: `/iam/v1/projects/${AppState.currentMenuType.id}/users`,
        prop: 'content',
        id: 'id',
        name: 'realName',
      },
      epic: {
        url: `/agile/v1/project/${projectId}/issues/epics/select_data`,
        prop: '',
        id: 'issueId',
        name: 'epicName',
      },
      sprint: {
        // post
        url: `/agile/v1/project/${projectId}/sprint/names`,
        prop: '',
        id: 'sprintId',
        name: 'sprintName',
      },
      label: {
        url: `/agile/v1/project/${projectId}/issue_labels`,
        prop: '',
        id: 'labelId',
        name: 'labelName',
      },
      component: {
        url: `/agile/v1/project/${projectId}/component`,
        prop: '',
        id: 'componentId',
        name: 'name',
      },
      version: {
        // post
        url: `/agile/v1/project/${projectId}/product_version/names`,
        prop: '',
        id: 'versionId',
        name: 'name',
      },
    };
    const arr = this.state.temp.map(v => (
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
          onChange={() => {
            const str = `filter-${index}-value`;
            this.props.form.setFieldsValue({
              str: undefined,
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

  renderValue(filter, operation) {
    if (!filter || !operation) {
      return (
        <Select label="值" />
      );
    } else if (['assignee', 'priority', 'status', 'reporter', 'created_user', 'last_update_user', 'epic', 'sprint', 'label', 'component', 'version'].indexOf(filter) > -1) {
      // select
      if (['=', '!='].indexOf(operation) > -1) {
        // return normal value
        return (
          <Select
            label="值"
            labelInValue
            onFocus={() => {
              this.getOption(filter, false);
            }}
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
            onFocus={() => {
              this.getOption(filter, true);
            }}
          >
            {this.tempOption(filter, true)}
          </Select>
        );
      } else {
        // return multiple value
        return (
          <Select
            label="值"
            labelInValue
            mode="multiple"
            onFocus={() => {
              this.getOption(filter, false);
            }}
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
          format={'YYYY-MM-DD HH:mm:ss'}
        />
      );
    } else {
      // story points && remainning time
      // return number input
      return (
        <NumericInput
          label="值"
          style={{ lineHeight: '22px', marginBottom: 0, width: 100 }}
        />
      );
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Sidebar
        className="c7n-component-component"
        title="创建快速搜索"
        okText="创建"
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
          title={`在项目"${AppState.currentMenuType.name}"中创建快速搜索`}
          description="请在下面输入模块名称、模块概要、负责人和默认经办人策略，创建新模版。"
        >
          <Form layout="vertical">
            <FormItem>
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                }],
              })(
                <Input
                  label="名称"
                  maxLength={30}
                />,
              )}
            </FormItem>
            {
              this.state.filters.map((filter, index) => (
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
                          })(
                            <Select label="属性">
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
                          })(
                            this.renderOperation(this.props.form.getFieldValue(`filter-${index}-prop`), index),
                          )}
                        </FormItem>
                        <FormItem style={{ width: 300, display: 'inline-block' }}>
                          {getFieldDecorator(`filter-${index}-value`, {
                            rules: [{
                              required: true,
                            }],
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
                            </Button>) : null
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
                const arr = this.state.filters.slice();
                arr.push({
                  prop: undefined,
                  rule: undefined,
                  value: undefined,
                });
                this.setState({
                  filters: arr,
                });
              }}
            >
              <Icon type="add icon" />
              <span>添加属性</span>
            </Button>
            <FormItem>
              {getFieldDecorator('description', {})(
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
