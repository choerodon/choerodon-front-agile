import React, { Component } from 'react';
import { Modal, Form, Input, Select, message, Icon, Button, DatePicker } from 'choerodon-ui';
import { Content, stores, axios } from 'choerodon-front-boot';
import _ from 'lodash';
import { NumericInput } from '../../../../../components/CommonComponent';
import './Filter.scss';

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
      temp: [],
    };
  }

  componentDidMount() {
    this.loadQuickFilterFiled();
  }

  loadQuickFilterFiled() {
    axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/quick_filter/fields`)
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
        const json = JSON.stringify({
          arr,
          o,
        });
        const obj = {
          childIncluded: true,
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
        axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/quick_filter`, obj)
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

  getOption(filter, addEmpty) {
    const projectId = AppState.currentMenuType.id;
    const OPTION_FILTER = {
      assignee: {
        url: `/iam/v1/projects/${AppState.currentMenuType.id}/users?page=0&size=9999`,
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
      reporter: {
        url: `/iam/v1/projects/${AppState.currentMenuType.id}/users?page=0&size=9999`,
        prop: 'content',
        id: 'id',
        name: 'realName',
      },
      created_user: {
        url: `/iam/v1/projects/${AppState.currentMenuType.id}/users?page=0&size=9999`,
        prop: 'content',
        id: 'id',
        name: 'realName',
      },
      last_updated_user: {
        url: `/iam/v1/projects/${AppState.currentMenuType.id}/users?page=0&size=9999`,
        prop: 'content',
        id: 'id',
        name: 'realName',
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
      influence_version: {
        // post
        url: `/agile/v1/projects/${projectId}/product_version/names`,
        prop: '',
        id: 'versionId',
        name: 'name',
      },
      fix_version: {
        // post
        url: `/agile/v1/projects/${projectId}/product_version/names`,
        prop: '',
        id: 'versionId',
        name: 'name',
      },
      issue_type: {
        url: '',
        prop: '',
        id: 'valueCode',
        name: 'name',
      },
    };
    if (filter !== 'issue_type') {
      axios[filter === 'sprint' || filter === 'influence_version' || filter === 'fix_version' ? 'post' : 'get'](OPTION_FILTER[filter].url)
        .then((res) => {
          this.setState({
            temp: OPTION_FILTER[filter].prop === '' ? res : res[OPTION_FILTER[filter].prop],
          });
        });
    } else {
      this.setState({
        temp: [
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
  }

  tempOption = (filter, addEmpty) => {
    const projectId = AppState.currentMenuType.id;
    const OPTION_FILTER = {
      assignee: {
        url: `/iam/v1/projects/${AppState.currentMenuType.id}/users?page=0&size=9999`,
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
      reporter: {
        url: `/iam/v1/projects/${AppState.currentMenuType.id}/users?page=0&size=9999`,
        prop: 'content',
        id: 'id',
        name: 'realName',
      },
      created_user: {
        url: `/iam/v1/projects/${AppState.currentMenuType.id}/users?page=0&size=9999`,
        prop: 'content',
        id: 'id',
        name: 'realName',
      },
      last_updated_user: {
        url: `/iam/v1/projects/${AppState.currentMenuType.id}/users?page=0&size=9999`,
        prop: 'content',
        id: 'id',
        name: 'realName',
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
      influence_version: {
        // post
        url: `/agile/v1/projects/${projectId}/product_version/names`,
        prop: '',
        id: 'versionId',
        name: 'name',
      },
      fix_version: {
        // post
        url: `/agile/v1/projects/${projectId}/product_version/names`,
        prop: '',
        id: 'versionId',
        name: 'name',
      },
      issue_type: {
        url: '',
        prop: '',
        id: 'valueCode',
        name: 'name',
      },
    };
    const arr = this.state.temp.map(v => (
      <Option key={v[OPTION_FILTER[filter].id]} value={v[OPTION_FILTER[filter].id]}>
        {v[OPTION_FILTER[filter].name]}
      </Option>
    ));
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
          style={['in', 'notIn'].indexOf(this.props.form.getFieldValue(`filter-${index}-prop`)) > -1 ? { marginTop: 8 } : {}}
          onChange={() => {
            const str = `filter-${index}-value`;
            this.props.form.setFieldsValue({
              [str]: undefined,
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
    } else if (['assignee', 'priority', 'status', 'reporter', 'created_user', 'last_updated_user', 'epic', 'sprint', 'label', 'component', 'influence_version', 'fix_version', 'issue_type'].indexOf(filter) > -1) {
      // select
      if (['=', '!='].indexOf(operation) > -1) {
        // return normal value
        return (
          <Select
            label="值"
            labelInValue
            filter
            optionFilterProp="children"
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
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
            filter
            optionFilterProp="children"
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
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
            filter
            optionFilterProp="children"
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
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
            filter
            optionFilterProp="children"
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
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
            style={{ lineHeight: '22px', marginBottom: 0, width: 300 }}
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
          description="通过定义快速搜索，可以在待办事项和活跃冲刺的快速搜索工具栏生效，帮助您更好的筛选过滤问题面板。"
          // link="#"
        >
          <Form layout="vertical">
            <FormItem style={{ width: 520 }}>
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                  message: '名称必填',
                }],
              })(
                <Input
                  label="名称"
                  maxLength={10}
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
                                  message: '关系不可为空',
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
                              message: '属性不可为空',
                            }],
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
                              message: '关系不可为空',
                            }],
                          })(
                            this.renderOperation(this.props.form.getFieldValue(`filter-${index}-prop`), index),
                          )}
                        </FormItem>
                        <FormItem style={{ width: 300, display: 'inline-block' }}>
                          {getFieldDecorator(`filter-${index}-value`, {
                            rules: [{
                              required: true,
                              message: '值不可为空',
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
              funcType="flat"
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
            <FormItem style={{ width: 520 }}>
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
