import React, { Component } from 'react';
import { Button } from 'choerodon-ui';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
// import ImageDrop from './ImageDrop';
import './WYSIWYGEditor.scss';
import cls from '../CommonComponent/ClickOutSide';

// Quill.register('modules/imageDrop', ImageDrop);

class WYSIWYGEditor extends Component {
  modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['image'],
      [{ color: [] }],
      // ['clean'],
    ],
    // imageDrop: true,
  };

  formats = [
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'image',
    'color',
  ];

  defaultStyle = {
    width: 498,
    height: 200,
    borderRight: 'none',
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  isHasImg = (delta) => {
    let pass = false;
    if (delta && delta.ops) {
      delta.ops.forEach((item) => {
        if (item.insert && item.insert.image) {
          pass = true;
        }
      });
    }
    return pass;
  };

  handleChange = (content, delta, source, editor) => {
    const { onChange } = this.props;
    const value = editor.getContents();
    if (onChange && value && value.ops) {
      onChange(value.ops);
    }
  };

  empty = () => {
    const { onChange } = this.props;
    onChange(undefined);
  };

  handleClickOutside = (evt) => {
    const { handleClickOutSide } = this.props;
    if (handleClickOutSide) {
      handleClickOutSide();
    }
  };

  render() {
    const {
      placeholder,
      value,
      toolbarHeight,
      style,
      bottomBar,
      handleDelete,
      handleSave,
    } = this.props;
    const { loading } = this.state;
    const newStyle = { ...this.defaultStyle, ...style };
    const editHeight = newStyle.height - (toolbarHeight || 42);
    return (
      <div style={{ width: '100%' }}>
        <div style={newStyle} className="react-quill-editor">
          <ReactQuill
            theme="snow"
            modules={this.modules}
            formats={this.formats}
            style={{ height: editHeight }}
            placeholder={placeholder || '描述'}
            defaultValue={value}
            onChange={this.handleChange}
          />
        </div>
        {
          bottomBar && (
            <div
              style={{
                padding: '0 8px',
                border: '1px solid #ccc',
                borderTop: 'none',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <Button 
                type="primary"
                onClick={() => {
                  this.empty();
                  handleDelete();
                }}
              >
                取消
              </Button>
              <Button
                type="primary"
                loading={loading}
                onClick={() => {
                  this.setState({ loading: true });
                  handleSave();
                }}
              >
                保存
              </Button>
            </div>
          )
        }
      </div>
    );
  }
}

export default cls(WYSIWYGEditor);
